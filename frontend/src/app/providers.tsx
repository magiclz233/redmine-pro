import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { ThemeController } from "@/app/theme-controller";

const queryClient = new QueryClient();

// Providers 统一承载全局上下文提供者，避免入口文件不断堆积。
export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeController />
      {children}
    </QueryClientProvider>
  );
}
