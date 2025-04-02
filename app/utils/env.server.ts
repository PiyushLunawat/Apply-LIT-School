// utils/env.server.ts
import { z } from "zod";

// Define the schema to validate and parse environment variables
const schema = z.object({
  API_BASE_URL: z.string().url(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_REGION: z.string(),
  // FIREBASE_API_KEY: z.string(),
  // FIREBASE_AUTH_DOMAIN: z.string(),
  // FIREBASE_PROJECT_ID: z.string(),
  // FIREBASE_STORAGE_BUCKET: z.string(),
  // FIREBASE_MESSAGING_SENDER_ID: z.string(),
  // FIREBASE_APP_ID: z.string(),
  // FIREBASE_MEASUREMENT_ID: z.string(),
});

// Parse the environment variables and validate them
const parsedEnv = schema.parse(process.env);

// Function to get only the public variables that you want to expose to the client
export function getPublicEnv() {
  return {
    API_BASE_URL: parsedEnv.API_BASE_URL, // Public URL for the client-side to access
    AWS_ACCESS_KEY_ID: parsedEnv.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: parsedEnv.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: parsedEnv.AWS_REGION,
  };
}

// Optionally, export all variables for server-side use
export function getAllEnv() {
  return parsedEnv;
}
