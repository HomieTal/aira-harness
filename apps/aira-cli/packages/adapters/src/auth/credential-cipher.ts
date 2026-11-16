import {
  createLegacyCredentialCipher,
  type CredentialCipher,
} from "@aira/shared/credential-security";
export type AiraCredentialCipher = CredentialCipher;
export interface AiraCredentialCipherOptions {
  env?: Record<string, string | undefined>;
}
/** 仅兼容旧格式；正式凭据仓库默认使用系统安全存储。 */
export function createAiraCredentialCipher(options: AiraCredentialCipherOptions = {}) {
  return createLegacyCredentialCipher(options.env);
}
export function isEncryptedAiraCredentialValue(value: string): boolean {
  return value.startsWith("enc:");
}
