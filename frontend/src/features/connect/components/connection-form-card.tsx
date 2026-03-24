import { MaterialSymbol } from "@/components/material-symbol";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { useConnectPage } from "@/features/connect/hooks/use-connect-page";

type ConnectionModel = ReturnType<typeof useConnectPage>;

interface ConnectionFormCardProps {
  connection: ConnectionModel;
  title: string;
  description: string;
  submitLabel: string;
  externalError?: string;
  showRememberToggle?: boolean;
  className?: string;
}

export function ConnectionFormCard({
  connection,
  title,
  description,
  submitLabel,
  externalError,
  showRememberToggle = true,
  className,
}: ConnectionFormCardProps) {
  const errorMessage =
    connection.testConnectionMutation.error instanceof Error
      ? connection.testConnectionMutation.error.message
      : externalError || "";

  return (
    <Card className={cn("border border-outline-variant/10 bg-surface-container/70 shadow-xl shadow-black/10 backdrop-blur-xl p-8 rounded-xl", className)}>
      <form
        className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            connection.onSubmit();
          }}
        >
          <div className="space-y-2">
            <label
              className="block text-xs font-medium uppercase tracking-widest text-on-surface-variant"
              htmlFor="connection-redmine-url"
            >
              实例 URL
            </label>
            <div className="relative">
              <MaterialSymbol
                name="link"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-outline"
                opticalSize={20}
              />
              <Input
                id="connection-redmine-url"
                className="h-11 border-none bg-surface-container-lowest pl-10 pr-4 text-sm shadow-inner shadow-black/10 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:ring-offset-0 transition-all placeholder:text-outline/40"
                placeholder="https://redmine.rd.virsical.cn"
                type="url"
                value={connection.draftUrl}
                onChange={(event) => connection.onDraftUrlChange(event.target.value)}
              />
            </div>
            {connection.formErrors.url ? (
              <p className="text-xs text-destructive">{connection.formErrors.url}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label
                className="block text-xs font-medium uppercase tracking-widest text-on-surface-variant"
                htmlFor="connection-redmine-api-key"
              >
                个人 API 密钥
              </label>
              <a
                href="#"
                className="text-[10px] font-semibold uppercase tracking-widest text-primary hover:text-primary-fixed-dim transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                获取密钥
              </a>
            </div>

            <div className="relative">
              <MaterialSymbol
                name="key"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-outline"
                opticalSize={20}
              />
              <Input
                id="connection-redmine-api-key"
                className="h-11 border-none bg-surface-container-lowest pl-10 pr-10 text-sm shadow-inner shadow-black/10 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:ring-offset-0 transition-all placeholder:text-outline/40"
                placeholder="••••••••••••••••••••••••••••••••"
                type={connection.showApiKey ? "text" : "password"}
                value={connection.draftApiKey}
                onChange={(event) => connection.onDraftApiKeyChange(event.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
                type="button"
                onClick={() => connection.setShowApiKey(!connection.showApiKey)}
              >
                <MaterialSymbol
                  name={connection.showApiKey ? "visibility_off" : "visibility"}
                  className="text-sm"
                  opticalSize={20}
                />
              </button>
            </div>

            {connection.formErrors.apiKey ? (
              <p className="text-xs text-destructive">{connection.formErrors.apiKey}</p>
            ) : null}
          </div>

          {showRememberToggle ? (
            <div className="flex items-center space-x-2 py-1">
              <input
                id="remember"
                checked={connection.rememberInstance}
                className="size-4 rounded border-outline-variant bg-surface-container-lowest text-primary focus:ring-0 focus:ring-offset-0"
                type="checkbox"
                onChange={(event) => connection.setRememberInstance(event.target.checked)}
              />
              <label htmlFor="remember" className="cursor-pointer select-none text-xs text-on-surface-variant">
                记住此实例
              </label>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          {connection.successMessage ? (
            <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
              {connection.successMessage}
            </div>
          ) : null}

          <Button
            className="h-11 w-full rounded-lg bg-primary-container text-primary-container-foreground hover:bg-primary-container/90 shadow-lg shadow-primary-container/10 transition-all active:scale-[0.98] font-semibold text-sm flex items-center justify-center space-x-2"
            disabled={connection.testConnectionMutation.isPending}
            type="submit"
          >
            {connection.testConnectionMutation.isPending ? (
              <>
                <MaterialSymbol name="progress_activity" className="animate-spin text-sm" opticalSize={20} />
                <span>连接中...</span>
              </>
            ) : (
              <>
                <span>连接账户</span>
                <MaterialSymbol name="arrow_forward" className="text-sm" opticalSize={20} />
              </>
            )}
          </Button>
        </form>
    </Card>
  );
}
