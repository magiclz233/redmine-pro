import { useQuery } from "@tanstack/react-query";

import { AppRoutes } from "@/app/routes";
import { ConnectPage } from "@/features/connect/pages/connect-page";
import { AppShell } from "@/layouts/app-shell";
import { getCurrentUser } from "@/services/redmine";
import { useAppStore } from "@/stores/use-app-store";

function AppBootstrapLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background-deep px-6">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container/80 p-8 text-center shadow-xl shadow-black/10 backdrop-blur-xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
          Bootstrapping Workspace
        </p>
        <h1 className="mt-4 text-xl font-semibold text-on-surface">正在刷新 Redmine 会话</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          正在根据当前配置校验连接并加载系统入口，请稍候。
        </p>
      </div>
    </main>
  );
}

export function AppFrame() {
  const redmineBaseUrl = useAppStore((state) => state.redmineBaseUrl);
  const apiKey = useAppStore((state) => state.apiKey);

  const hasCredentials = Boolean(redmineBaseUrl.trim() && apiKey.trim());

  const sessionQuery = useQuery({
    queryKey: ["app-session", redmineBaseUrl, apiKey],
    queryFn: () =>
      getCurrentUser({
        baseUrl: redmineBaseUrl,
        apiKey,
      }),
    enabled: hasCredentials,
    staleTime: 60_000,
    retry: false,
  });

  if (!hasCredentials) {
    return <ConnectPage mode="entry" />;
  }

  if (sessionQuery.isPending) {
    return <AppBootstrapLoading />;
  }

  if (sessionQuery.error instanceof Error) {
    return <ConnectPage externalError={sessionQuery.error.message} mode="entry" />;
  }

  return (
    <AppShell
      currentUser={{
        name: sessionQuery.data?.name || "Redmine User",
        login: sessionQuery.data?.login || "workspace",
      }}
    >
      <AppRoutes />
    </AppShell>
  );
}
