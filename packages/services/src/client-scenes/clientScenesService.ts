import type { ApiClient } from "@aira/shared";
import { readApiJson } from "../providers/api/apiJson.js";
import { AIRA_CLIENT_SCENES_URL } from "../providers/api/apiEndpoints.js";
import type { ClientScenesResponse, IClientScenesService } from "./clientScenes.js";

export function createClientScenesService(dependencies: {
  apiClient: ApiClient;
}): IClientScenesService {
  return {
    list: () =>
      readApiJson<ClientScenesResponse>(dependencies.apiClient, AIRA_CLIENT_SCENES_URL, {
        method: "GET",
      }),
  };
}
