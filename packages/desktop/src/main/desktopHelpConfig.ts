import { net } from "electron";
import {
  buildHelpAppConfigUrl,
  buildAiraSourceHeadersFromContext,
  createHelpAppConfigReader,
  resolveOptionalAiraAuthorization,
  type AiraJwtTokenResolver,
  AIRA_ENV,
} from "@aira/shared";

export function createDesktopHelpConfigReader(options: {
  resolveEndpointOrigin: () => Promise<string>;
  appVersion: string;
  deviceMid: string;
  /** 当前界面语言；以前不传，X-Client-Language 固定为 unknown。 */
  getClientLanguage: () => string;
  resolveAiraJwtToken?: AiraJwtTokenResolver;
}) {
  const read = createHelpAppConfigReader({
    fetchImpl: (input, init) => net.fetch(input instanceof URL ? input.href : input, init),
  });
  return async () => {
    const endpointOrigin = await options.resolveEndpointOrigin();
    const authorization = await resolveOptionalAiraAuthorization(options.resolveAiraJwtToken);
    return read(
      buildHelpAppConfigUrl(
        endpointOrigin,
        options.appVersion,
        `${process.platform}-${process.arch}`,
      ),
      {
        ...(authorization ? { Authorization: authorization } : {}),
        ...buildAiraSourceHeadersFromContext({
          endpointOrigin,
          appVersion: options.appVersion,
          clientLanguage: options.getClientLanguage(),
          deviceMid: options.deviceMid,
          platform: process.platform,
          arch: process.arch,
          releaseChannel: AIRA_ENV,
          sourceTitle: "electron",
        }),
      },
    );
  };
}
