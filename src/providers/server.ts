import { QueryClient } from '@tanstack/react-query'

// Server-side query client factory
export function createServerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        // Longer cache time for server
        gcTime: 10 * 60 * 1000,
        retry: false, // Don't retry on server
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  })
}

// Get a server query client instance
export function getServerQueryClient() {
  return createServerQueryClient()
} 