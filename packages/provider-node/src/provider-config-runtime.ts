import {
  ProviderConfigService,
  type ProviderConfigLayerSnapshot,
  type ProviderConfigLayerUpdate,
} from "@aira/provider";
import { NodeAiraBuiltinProviderConfigSource } from "./aira-builtin-provider-config-source.js";
import {
  EndpointScopedAiraBuiltinSource,
  type EndpointScopedAiraBuiltinSourceOptions,
} from "./endpoint-scoped-aira-builtin-source.js";
import {
  AiraBuiltinRemoteSynchronizer,
  type AiraBuiltinRemoteSynchronizerOptions,
  type AiraBuiltinRefreshResult,
} from "./aira-builtin-remote-synchronizer.js";
import {
  NodePersonalProviderConfigRepository,
  type PersonalProviderConfigRecoveryEvent,
} from "./personal-provider-config-repository.js";

export interface NodeProviderConfigRuntimeOptions {
  readonly airaBuiltinFilePath: string;
  readonly airaBuiltinActiveFilePath?: string;
  readonly airaBuiltinRemote?: Omit<AiraBuiltinRemoteSynchronizerOptions, "source">;
  readonly airaBuiltinEnvironment?: Omit<
    EndpointScopedAiraBuiltinSourceOptions,
    "bundledFilePath"
  >;
  readonly onAiraBuiltinRefreshError?: (error: unknown) => void;
  readonly onPersonalConfigRecovery?: (event: PersonalProviderConfigRecoveryEvent) => void;
  readonly onPersonalConfigPollingError?: (error: unknown) => void;
  readonly personalFilePath: string;
  readonly personalPollingIntervalMs?: number | false;
  readonly importLegacy?: (
    airaBuiltin: ProviderConfigLayerSnapshot,
  ) => Promise<ProviderConfigLayerUpdate | null>;
  readonly watch?: boolean;
}

/** 组装一个 Node.js 进程内共享的 Aira Built-in/Personal Config 运行边界。 */
export class NodeProviderConfigRuntime {
  readonly configService: ProviderConfigService;
  readonly #airaBuiltinSource:
    | NodeAiraBuiltinProviderConfigSource
    | EndpointScopedAiraBuiltinSource;
  readonly #personalRepository: NodePersonalProviderConfigRepository;
  readonly #remoteSynchronizer?: AiraBuiltinRemoteSynchronizer;
  readonly #onRemoteRefreshError?: (error: unknown) => void;
  #startPromise: Promise<void> | null = null;
  #disposed = false;
  readonly #checkListeners = new Set<() => Promise<void>>();
  #checkTimer: ReturnType<typeof setInterval> | null = null;
  #checkInFlight: Promise<void> | null = null;

  constructor(options: NodeProviderConfigRuntimeOptions) {
    this.#airaBuiltinSource = options.airaBuiltinEnvironment
      ? new EndpointScopedAiraBuiltinSource({
          bundledFilePath: options.airaBuiltinFilePath,
          ...options.airaBuiltinEnvironment,
        })
      : new NodeAiraBuiltinProviderConfigSource({
          bundledFilePath: options.airaBuiltinFilePath,
          activeFilePath: options.airaBuiltinActiveFilePath,
          watch: options.watch,
        });
    this.#remoteSynchronizer =
      options.airaBuiltinRemote &&
      this.#airaBuiltinSource instanceof NodeAiraBuiltinProviderConfigSource
        ? new AiraBuiltinRemoteSynchronizer({
            source: this.#airaBuiltinSource,
            ...options.airaBuiltinRemote,
          })
        : undefined;
    this.#onRemoteRefreshError = options.onAiraBuiltinRefreshError;
    this.#personalRepository = new NodePersonalProviderConfigRepository({
      filePath: options.personalFilePath,
      onRecovery: options.onPersonalConfigRecovery,
      onPollingError: options.onPersonalConfigPollingError,
      pollingIntervalMs: options.personalPollingIntervalMs,
      ...(options.importLegacy
        ? {
            importLegacy: async () => options.importLegacy!(await this.#airaBuiltinSource.read()),
          }
        : {}),
    });
    this.configService = new ProviderConfigService({
      airaBuiltinSource: this.#airaBuiltinSource,
      personalRepository: this.#personalRepository,
    });
  }

  resolveAiraBuiltinActiveFilePath(): Promise<string> {
    return this.#airaBuiltinSource instanceof NodeAiraBuiltinProviderConfigSource
      ? Promise.resolve(this.#airaBuiltinSource.activeFilePath)
      : this.#airaBuiltinSource.resolveActiveFilePath();
  }

  get personalRepository(): import("@aira/provider").PersonalProviderConfigRepository {
    return this.#personalRepository;
  }

  /** Environment 同一周期检查中恢复未对齐依赖，不被下载 TTL 或失败挡住。 */
  onDidCheckAiraBuiltin(listener: () => Promise<void>): () => void {
    this.#checkListeners.add(listener);
    return () => this.#checkListeners.delete(listener);
  }

  start(): Promise<void> {
    if (this.#disposed) throw new Error("NodeProviderConfigRuntime 已 dispose");
    if (this.#startPromise) return this.#startPromise;
    const startPromise = this.configService.read().then(() => {
      if (this.#disposed) return;
      void this.#checkBackground();
      // Managed Worker 无下载配置也无恢复 owner，不建立周期任务。
      if (
        this.#remoteSynchronizer ||
        this.#airaBuiltinSource instanceof EndpointScopedAiraBuiltinSource ||
        this.#checkListeners.size > 0
      ) {
        this.#checkTimer = setInterval(() => {
          void this.#checkBackground();
        }, 60_000);
        this.#checkTimer.unref?.();
      }
    });
    this.#startPromise = startPromise;
    void startPromise.catch(() => {
      if (this.#startPromise === startPromise) this.#startPromise = null;
    });
    return startPromise;
  }

  refreshAiraBuiltin(options?: { readonly force?: boolean }): Promise<AiraBuiltinRefreshResult> {
    if (this.#disposed) return Promise.resolve("disposed");
    if (this.#airaBuiltinSource instanceof EndpointScopedAiraBuiltinSource) {
      return this.#airaBuiltinSource.refresh(options);
    }
    return this.#remoteSynchronizer?.refresh(options) ?? Promise.resolve("skipped");
  }

  #checkBackground(): Promise<void> {
    if (this.#disposed) return Promise.resolve();
    if (this.#checkInFlight) return this.#checkInFlight;
    const check = Promise.allSettled([
      this.refreshAiraBuiltin(),
      ...[...this.#checkListeners].map((listener) => Promise.resolve().then(listener)),
    ])
      .then((results) => {
        if (this.#disposed) return;
        for (const result of results)
          if (result.status === "rejected") this.#onRemoteRefreshError?.(result.reason);
      })
      .finally(() => {
        if (this.#checkInFlight === check) this.#checkInFlight = null;
      });
    this.#checkInFlight = check;
    return check;
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    if (this.#checkTimer) clearInterval(this.#checkTimer);
    this.#checkTimer = null;
    this.#checkListeners.clear();
    this.#remoteSynchronizer?.dispose();
    this.configService.dispose();
    this.#personalRepository.dispose();
    this.#airaBuiltinSource.dispose();
  }
}

export function createNodeProviderConfigRuntime(
  options: NodeProviderConfigRuntimeOptions,
): NodeProviderConfigRuntime {
  return new NodeProviderConfigRuntime(options);
}
