# @aira-dev/plugin-api

Type definitions for Aira plugin extensions. The package has types only; it has no runtime code.

Aira 插件扩展代码用的类型包。只有类型，没有运行时代码。

## Install

```sh
npm install --save-dev @aira-dev/plugin-api
```

## Entries

| Import                              | Types                                                        |
| ----------------------------------- | ------------------------------------------------------------ |
| `@aira-dev/plugin-api`             | `ExtensionContext`, `Disposable`, scopes, views, error codes |
| `@aira-dev/plugin-api/manifest`    | The manifest `extension` key, slots, grants                  |
| `@aira-dev/plugin-api/sessions`    | Session projection, session action inputs and results        |
| `@aira-dev/plugin-api/protocol-v4` | Conversation rows, context composition, generation metrics   |

```ts
import type { ExtensionContext } from "@aira-dev/plugin-api";

export function activate(ctx: ExtensionContext): void {
  ctx.commands.register("hello", () => ctx.log.info("hello"));
}
```

Use `import type` only. The package has no JavaScript.

## Versions

The package version is the plugin API version of Aira. Set `extension.engines.aira` in the plugin manifest to the version you build against, for example `"^1.4.0"`.

- A new capability or a new optional field raises the minor version.
- A removed capability or a changed meaning raises the major version.
- Aira loads an extension only when its plugin API version satisfies `engines.aira`.

插件清单的 `extension.engines.aira` 写你构建时用的版本，例如 `"^1.4.0"`。Aira 的插件 API 版本满足这个范围时才加载扩展。
