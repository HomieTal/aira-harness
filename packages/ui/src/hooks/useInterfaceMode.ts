import { useAiraStoreWithDefault } from "@/store/StoreProvider.js";

export function useIsOfficeMode(): boolean {
  return useAiraStoreWithDefault((state) => state.interfaceMode === "office", false);
}
