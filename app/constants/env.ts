// constants/env.ts
/**
 * Environment variable key categorization
 * IMPORTANT: ALL environment variables are considered sensitive.
 * Here we only define which of them are required on the client.
 */

// Environment variables required on the client
export const CLIENT_REQUIRED_ENV_KEYS = [
  "REMIX_PUBLIC_API_BASE_URL",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
];

// Environment variables related to authentication - particularly sensitive
export const AUTH_ENV_KEYS = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_REGION",
];

// Environment variables that are not exported to the client
export const SERVER_ONLY_ENV_KEYS = [
  "REMIX_APP_MODE",
  // Other server-side variables
];

// All known environment variables - collected for convenience
export const ALL_ENV_KEYS = [
  ...CLIENT_REQUIRED_ENV_KEYS,
  ...AUTH_ENV_KEYS,
  ...SERVER_ONLY_ENV_KEYS,
];

/**
 * Creates a safe environment object for client-side use
 * Only includes variables that are safe to expose to the client
 */
export function createClientEnv() {
  const env: Record<string, string | undefined> = {};

  // Add client-side required variables
  CLIENT_REQUIRED_ENV_KEYS.forEach((key) => {
    env[key] = process.env[key];
  });

  // Add authentication variables
  AUTH_ENV_KEYS.forEach((key) => {
    env[key] = process.env[key];
  });

  return env;
}

/**
 * Creates object with all environment variables
 * For server-side use only
 */
export function createServerEnv() {
  const env: Record<string, string | undefined> = {};

  // Add all variables
  ALL_ENV_KEYS.forEach((key) => {
    env[key] = process.env[key];
  });

  return env;
}
