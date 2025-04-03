// hooks/useEnv.ts
import { useLoaderData } from "@remix-run/react";
import { useAtomValue, useSetAtom } from "jotai";

import {
  awsAccessKeyIdAtom,
  awsSecretAccessKeyAtom,
  awsRegionAtom,
  envAtom,
  getEnv,
  syncEnvCache,
} from "~/atoms/envAtoms";
import { useIsomorphicLayoutEffect } from "~/utils/hooks";
import { EnvVariables } from "~/types/env";

/**
 * Hook for getting all environment variables.
 * Use the specialized hooks below for better performance.
 */
export function useEnv() {
  return useAtomValue(envAtom);
}

/**
 * Specialized hooks for individual variables.
 * These hooks trigger updates only when the specific value changes.
 */
export function useAwsAccessKeyIdAtom() {
  return useAtomValue(awsAccessKeyIdAtom);
}

export function useAwsSecretAccessKeyAtom() {
  return useAtomValue(awsSecretAccessKeyAtom);
}

export function useAwsRegionAtom() {
  return useAtomValue(awsRegionAtom);
}

/**
 * Initializes environment variables from loader data.
 * Call this hook as early as possible in the component hierarchy.
 */
export function useInitializeEnv() {
  const loaderData = useLoaderData<{ ENV?: EnvVariables }>();
  const setEnv = useSetAtom(envAtom);
  const setAwsAccessKeyIdAtom = useSetAtom(awsAccessKeyIdAtom);
  const setAwsSecretAccessKeyAtom = useSetAtom(awsSecretAccessKeyAtom);
  const setAwsRegionAtom = useSetAtom(awsRegionAtom);

  useIsomorphicLayoutEffect(() => {
    if (loaderData?.ENV) {
      // Update general atom
      setEnv(loaderData.ENV);

      // Update individual atoms
      if (loaderData.ENV.AWS_ACCESS_KEY_ID !== undefined)
        setAwsAccessKeyIdAtom(loaderData.ENV.AWS_ACCESS_KEY_ID);

      if (loaderData.ENV.AWS_ACCESS_KEY_ID !== undefined)
        setAwsSecretAccessKeyAtom(loaderData.ENV.AWS_SECRET_ACCESS_KEY);

      if (loaderData.ENV.AWS_ACCESS_KEY_ID !== undefined)
        setAwsRegionAtom(loaderData.ENV.AWS_REGION);

      // Synchronize cache
      syncEnvCache(loaderData.ENV);
    }
  }, [loaderData?.ENV]);
}

/**
 * Testing utility. Allows setting fake variable values for tests.
 */
export function mockEnvForTests(env: Partial<EnvVariables>) {
  if (process.env.NODE_ENV !== "test") {
    console.warn("mockEnvForTests should only be used in test environment");
    return;
  }

  syncEnvCache({ ...getEnv(), ...env });
}
