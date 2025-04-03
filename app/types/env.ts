// types/env.ts
/**
 * Interface for all environment variables
 * Used for type safety throughout the application
 */
export interface EnvVariables {
  REMIX_APP_MODE?: string;
  REMIX_PUBLIC_API_BASE_URL?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
}

/**
 * Type for client-side environment data
 * This is a subset of EnvVariables
 */
export interface ClientEnvData {
  REMIX_PUBLIC_API_BASE_URL: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
}

// Extend Window interface to include environment variables
declare global {
  interface Window {
    __ENV__?: EnvVariables;
    __REACT_QUERY_STATE__?: unknown;
    __envPerfStats?: () => void;
  }
}
