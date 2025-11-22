'use client';
// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import { toast } from '@acme/ui/sonner';
import { QueryClient, QueryClientProvider, isServer } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ReactNode } from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        throwOnError(error) {
          if (error instanceof AxiosError) {
            const errorData = error.response?.data;
            const errorMessage = errorData?.error || error.message || 'An error occurred';
            const description = Array.isArray(errorData?.message)
              ? errorData.message.join(', ')
              : typeof errorData?.message === 'string'
                ? errorData.message
                : error.message || '';

            toast.error(errorMessage, {
              description: description || undefined,
              action: {
                label: 'Close',
                onClick: () => {},
              },
            });
          } else {
            const errorMessage = (error as unknown as Record<string, string>).shortMessage ?? error.message ?? error.name ?? 'An error occurred';
            const description = typeof error?.cause === 'string' ? error.cause : error.name || '';

            toast.error(errorMessage, {
              description: description || undefined,
              action: {
                label: 'Close',
                onClick: () => {},
              },
            });
          }

          return false;
        },
      },
      mutations: {
        onError(error) {
          if (error instanceof AxiosError) {
            const errorData = error.response?.data;
            const errorMessage = errorData?.error || error.message || 'An error occurred';
            const description = Array.isArray(errorData?.message)
              ? errorData.message.join(', ')
              : typeof errorData?.message === 'string'
                ? errorData.message
                : error.message || '';

            toast.error(errorMessage, {
              description: description || undefined,
              action: {
                label: 'Close',
                onClick: () => {},
              },
            });
          } else {
            const errorMessage = (error as unknown as Record<string, string>).shortMessage ?? error.message ?? 'An error occurred';
            const description = typeof error?.cause === 'string' ? error.cause : error.name || '';

            toast.error(errorMessage, {
              description: description || undefined,
              action: {
                label: 'Close',
                onClick: () => {},
              },
            });
          }
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
