"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

type UseQueryParamsOptions<
  T extends Record<string, string | number | boolean | null | undefined>,
> = {
  /**
   * Default values for query parameters
   */
  defaults?: Partial<T>;
  /**
   * Whether to scroll to top when updating params
   * @default false
   */
  scroll?: boolean;
};

type UseQueryParamsReturn<
  T extends Record<string, string | number | boolean | null | undefined>,
> = {
  /**
   * Current query parameters as an object
   */
  params: T;
  /**
   * Update query parameters by merging with existing params
   */
  setParams: (updates: Partial<T>) => void;
  /**
   * Replace all query parameters
   */
  replaceParams: (newParams: Partial<T>) => void;
  /**
   * Remove specific query parameters
   */
  removeParams: (...keys: (keyof T)[]) => void;
  /**
   * Clear all query parameters
   */
  clearParams: () => void;
};

/**
 * Hook to manage query parameters as an object
 *
 * @example
 * ```tsx
 * // Simple usage
 * const { params, setParams } = useQueryParams({ page: 1, limit: 10 });
 * // params = { page: '1', limit: '10' } (from URL or defaults)
 *
 * // Update params
 * setParams({ page: 2 }); // Merges with existing, updates URL
 *
 * // With defaults
 * const { params, setParams } = useQueryParams(
 *   { page: 1, limit: 10 },
 * );
 * ```
 */
export function useQueryParams<
  T extends Record<string, string | number | boolean | null | undefined>,
>(
  defaults: T = {} as T,
  options: UseQueryParamsOptions<T> = {}
): UseQueryParamsReturn<T> {
  const { scroll = false } = options;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current query params into object with defaults
  const params = useMemo(() => {
    const result = { ...defaults } as T;

    // Override with values from URL
    for (const key in defaults) {
      const value = searchParams.get(key);
      if (value !== null) {
        // Try to parse as number or boolean, otherwise keep as string
        const numValue = Number(value);
        if (!isNaN(numValue) && value.trim() !== "") {
          result[key] = numValue as T[typeof key];
        } else if (value === "true" || value === "false") {
          result[key] = (value === "true") as T[typeof key];
        } else {
          result[key] = value as T[typeof key];
        }
      }
    }

    return result;
  }, [searchParams, defaults]);

  // Update query params by merging with existing
  const setParams = useCallback(
    (updates: Partial<T>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      // Update each key in the updates object
      for (const key in updates) {
        const value = updates[key];

        if (value !== null && value !== undefined && value !== "") {
          newParams.set(key, String(value));
        } else {
          newParams.delete(key);
        }
      }

      const queryString = newParams.toString();
      router.push(queryString ? `?${queryString}` : window.location.pathname, {
        scroll,
      });
    },
    [router, searchParams, defaults, scroll]
  );

  // Replace all query params
  const replaceParams = useCallback(
    (newParams: Partial<T>) => {
      const params = new URLSearchParams();

      for (const key in newParams) {
        const value = newParams[key];

        if (value !== null && value !== undefined && value !== "") {
          params.set(key, String(value));
        }
      }

      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : window.location.pathname, {
        scroll,
      });
    },
    [router, defaults, scroll]
  );

  // Remove specific params
  const removeParams = useCallback(
    (...keys: (keyof T)[]) => {
      const newParams = new URLSearchParams(searchParams.toString());
      keys.forEach((key) => newParams.delete(String(key)));

      const queryString = newParams.toString();
      router.push(queryString ? `?${queryString}` : window.location.pathname, {
        scroll,
      });
    },
    [router, searchParams, scroll]
  );

  // Clear all params
  const clearParams = useCallback(() => {
    router.push(window.location.pathname, { scroll });
  }, [router, scroll]);

  return {
    params,
    setParams,
    replaceParams,
    removeParams,
    clearParams,
  };
}
