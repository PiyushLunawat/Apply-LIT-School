// config/fallbacks.ts
/**
 * Fallback values for environment variables
 * Used when variables are not available through regular channels
 * These are critical for early application initialization before React is ready
 */
export const ENV_FALLBACKS = {
  REMIX_PUBLIC_API_BASE_URL: "https://dev.apply.litschool.in",
  // REMIX_PUBLIC_API_BASE_URL: "http://localhost:4000",
  AWS_ACCESS_KEY_ID: "AKIA3A3WKZTB3X3X75FW",
  AWS_SECRET_ACCESS_KEY: "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",
  AWS_REGION: "eu-north-1",
};

/**
 * Get fallback value for an environment variable
 * @param key Environment variable key
 * @returns Fallback value or undefined if not available
 */
export const getFallbackValue = (key: string): string | undefined => {
  return ENV_FALLBACKS[key as keyof typeof ENV_FALLBACKS];
};
