"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";
import { LiveMarketProvider } from "@/lib/context/LiveMarketContext";
import { UserPlanProvider } from "@/lib/context/UserPlanContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LiveMarketProvider>
        <UserPlanProvider>
          {children}
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "#161d30",
                border: "1px solid #1e2d45",
                color: "#ffffff",
              },
            }}
          />
        </UserPlanProvider>
      </LiveMarketProvider>
    </QueryClientProvider>
  );
}
