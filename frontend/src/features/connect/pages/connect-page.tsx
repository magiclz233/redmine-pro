import { ConnectionFormCard } from "@/features/connect/components/connection-form-card";
import { useConnectPage } from "@/features/connect/hooks/use-connect-page";
import { MaterialSymbol } from "@/components/material-symbol";

interface ConnectPageProps {
  externalError?: string;
  mode?: "entry" | "settings";
}

export function ConnectPage({ externalError = "", mode = "entry" }: ConnectPageProps) {
  const connection = useConnectPage({
    redirectTo: mode === "entry" ? "/dashboard" : undefined,
    persistOnSuccess: true,
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background-deep px-6 py-10">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-64 w-full overflow-hidden opacity-20">
        <div className="absolute bottom-[-10%] left-[-10%] h-[150%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[150%] w-[40%] rounded-full bg-primary-container/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[440px] space-y-8">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container text-primary-foreground shadow-lg shadow-primary-container/20">
            <MaterialSymbol name="architecture" filled opticalSize={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">Redmine Pro</h1>
            <p className="mt-1 text-sm text-on-surface-variant">The Monolith Architect</p>
          </div>
        </div>

        <ConnectionFormCard
          className="bg-surface-container/70"
          connection={connection}
          description="先完成 Redmine 实例配置与连接测试，通过后再进入系统。"
          externalError={externalError}
          submitLabel="测试并进入系统"
          title="连接 Redmine"
        />

        <div className="flex flex-col items-center space-y-6 pt-4">
          <div className="flex items-center space-x-4">
            <div className="h-px w-8 bg-outline-variant/20" />
            <span className="text-[10px] uppercase tracking-widest text-outline/50">
              Security Encrypted
            </span>
            <div className="h-px w-8 bg-outline-variant/20" />
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-outline/40">
            v2.4.0-stable | {connection.instanceHost ? `Connected to ${connection.instanceHost}` : "Connected to redmine.internal"}
          </p>
        </div>
      </div>
    </main>
  );
}
