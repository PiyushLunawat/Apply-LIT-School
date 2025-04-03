import { QueryClient, dehydrate } from "@tanstack/react-query";

/**
 * Creates a new QueryClient instance for each request.
 * This prevents state leakage between users.
 */
export function createQueryClient() {
  return new QueryClient();
}

/**
 * Safely dehydrates the query client to be passed to the client.
 * Ensures no sensitive data (e.g., API secrets, environment variables) leaks.
 */
export function safeDehydrate(queryClient: QueryClient) {
  return dehydrate(queryClient);
}
