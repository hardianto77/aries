import { aries } from 'aries-data-provider';
import type { DynamicSettingProps, ImageDetail } from 'aries-data-provider';

type AriesKeys = keyof typeof aries;

type AriesParams = {
  modelOptions: Omit<NonNullable<DynamicSettingProps['conversation']>, AriesKeys>;
  resendFiles: boolean;
  promptPrefix?: string | null;
  maxContextTokens?: number;
  fileTokenLimit?: number;
  modelLabel?: string | null;
  imageDetail?: ImageDetail;
};

/**
 * Separates Aries-specific parameters from model options
 * @param options - The combined options object
 */
export function extractAriesParams(
  options?: DynamicSettingProps['conversation'],
): AriesParams {
  if (!options) {
    return {
      modelOptions: {} as Omit<NonNullable<DynamicSettingProps['conversation']>, AriesKeys>,
      resendFiles: aries.resendFiles.default as boolean,
    };
  }

  const modelOptions = { ...options };

  const resendFiles =
    (delete modelOptions.resendFiles, options.resendFiles) ??
    (aries.resendFiles.default as boolean);
  const promptPrefix = (delete modelOptions.promptPrefix, options.promptPrefix);
  const maxContextTokens = (delete modelOptions.maxContextTokens, options.maxContextTokens);
  const fileTokenLimit = (delete modelOptions.fileTokenLimit, options.fileTokenLimit);
  const modelLabel = (delete modelOptions.modelLabel, options.modelLabel);
  const imageDetail = (delete modelOptions.imageDetail, options.imageDetail);

  return {
    modelOptions: modelOptions as Omit<
      NonNullable<DynamicSettingProps['conversation']>,
      AriesKeys
    >,
    maxContextTokens,
    fileTokenLimit,
    promptPrefix,
    resendFiles,
    modelLabel,
    imageDetail,
  };
}
