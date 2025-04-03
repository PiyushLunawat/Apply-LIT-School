import { atom } from "jotai";
import { EnvVariables } from "~/types/env";
import { getFallbackValue } from "~/config/fallbacks";

// Memoized function for getting variables (for non-React code)
let cachedEnv: EnvVariables = {};
let cachedValues: Record<string, string | undefined> = {};

/**
 * Initializes the environment variable cache.
 * Important to call this as early as possible in the client entry point.
 */
export const initialzeEnvCache = (env: EnvVariables): void => {
  cachedEnv = { ...env };
  // Clear value cache when changing variables
  cachedValues = {};
};

/**
 * Synchronizes the environment variable cache with atoms.
 * Called in useInitializeEnv.
 */
export const syncEnvCache = (env: EnvVariables): void => {
  cachedEnv = { ...env };
  // Clear value cache when changing variables
  cachedValues = {};
};

/**
 * Implementation of environment value getter
 * @param key - Environment variable key
 * @returns Value of the environment variable
 */
const getEnvValueImpl = (key: keyof EnvVariables): string | undefined => {
  // Check cache to avoid unnecessary calculations
  if (cachedValues[key] !== undefined) {
    return cachedValues[key] as string | undefined;
  }

  // Server: use process.env
  if (typeof window === "undefined") {
    const value = process.env[key];
    cachedValues[key] = value;
    return value;
  }

  // Client: first check cache
  if (cachedEnv && cachedEnv[key] !== undefined) {
    cachedValues[key] = cachedEnv[key];
    return cachedEnv[key];
  }

  // When variables need to be loaded early (before React initialization)
  // If we're still on the client and don't have variables through useInitializeEnv,
  // use fallback values from centralized config
  const fallbackValue = getFallbackValue(key);
  if (fallbackValue) {
    cachedValues[key] = fallbackValue;
    return fallbackValue;
  }

  // Value not found
  cachedValues[key] = undefined;
  return undefined;
};

/**
 * Gets the value of an environment variable.
 * Memoizes results for improved performance.
 */
export let getEnvValue: (key: keyof EnvVariables) => string | undefined =
  getEnvValueImpl;

/**
 * Returns all environment variables.
 * Uses memoization for improved performance.
 */
export const getEnv = (): EnvVariables => {
  // Server: use process.env
  if (typeof window === "undefined") {
    return {
      REMIX_APP_MODE: process.env.REMIX_APP_MODE,
      REMIX_PUBLIC_API_BASE_URL: process.env.REMIX_PUBLIC_API_BASE_URL,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
    };
  }

  // Client: use cache
  if (Object.keys(cachedEnv).length > 0) {
    return cachedEnv;
  }

  return {};
};

// Use separate atoms for each environment variable
// This reduces the number of unnecessary renders

// Function to create an atom for a specific variable
const createEnvAtom = <K extends keyof EnvVariables>(key: K) => {
  return atom(getEnvValue(key));
};

// Atoms for frequently used variables
export const awsAccessKeyIdAtom = createEnvAtom("AWS_ACCESS_KEY_ID");
export const awsSecretAccessKeyAtom = createEnvAtom("AWS_SECRET_ACCESS_KEY");
export const awsRegionAtom = createEnvAtom("AWS_REGION");

// General atom for all variables (for compatibility)
export const envAtom = atom<EnvVariables>(getEnv());

/**
 * Optimization for microfrontends and loadable modules.
 * Preload atoms for critical variables.
 */
export const preloadCriticalEnvAtoms = () => {
  // Load only the most critical values to speed up work
  getEnvValue("REMIX_PUBLIC_API_BASE_URL");
};

/**
 * Optimization for data types.
 * Automatically converts string values to appropriate types.
 */
export const getEnvValueTyped = <T>(
  key: keyof EnvVariables,
  type: "string" | "number" | "boolean"
): T => {
  const value = getEnvValue(key);

  if (value === undefined) return undefined as T;

  switch (type) {
    case "number":
      return Number(value) as T;
    case "boolean":
      return (value === "true" || value === "1") as T;
    default:
      return value as T;
  }
};

// Performance monitoring in development mode
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  const callCounts: Record<string, number> = {};
  const callTimes: Record<string, number> = {};

  // Instrumented version of the function
  getEnvValue = (key: keyof EnvVariables) => {
    // Count calls
    callCounts[key] = (callCounts[key] || 0) + 1;

    // Measure time
    const startTime = performance.now();
    const result = getEnvValueImpl(key);
    const endTime = performance.now();

    // Save execution time
    callTimes[key] = (callTimes[key] || 0) + (endTime - startTime);

    // Log if too many calls
    if (callCounts[key] > 10) {
      console.warn(`ENV: Multiple access to ${key}: ${callCounts[key]} times`);
    }
    return result;
  };

  // Add function for displaying statistics
  window.__envPerfStats = () => {
    console.table(
      Object.keys(callCounts).map((key) => ({
        key,
        calls: callCounts[key],
        totalTime: callTimes[key].toFixed(2) + "ms",
        avgTime: (callTimes[key] / callCounts[key]).toFixed(2) + "ms",
      }))
    );
  };

  console.log(
    "ENV: Performance measurement tools activated. Call window.__envPerfStats() to view statistics."
  );
}
