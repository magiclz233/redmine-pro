import { ConnectionFormCard } from "@/features/connect/components/connection-form-card";
import { useConnectPage } from "@/features/connect/hooks/use-connect-page";
import { SavedInstancesCard } from "@/features/settings/components/saved-instances-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/stores/use-app-store";
import { useThemeStore, type ThemeMode } from "@/stores/use-theme-store";

export function SettingsPage() {
  const connection = useConnectPage({ persistOnSuccess: true });
  const activeInstanceId = useAppStore((state) => state.activeInstanceId);
  const instances = useAppStore((state) => state.instances);
  const activateInstance = useAppStore((state) => state.activateInstance);
  const removeInstance = useAppStore((state) => state.removeInstance);
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);

  return (
    <main className="mx-auto min-h-full w-full max-w-7xl space-y-6 px-4 py-5 md:px-8 md:py-8">
      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container/85 p-5 shadow-sm backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.24em] text-on-surface-variant">stitch_7.html</p>
        <h1 className="mt-2 text-2xl font-semibold text-on-surface">设置</h1>
        <p className="mt-2 max-w-3xl text-sm text-on-surface-variant">
          系统内的连接切换、外观模式与本地行为设置统一在这里处理，不再把连接表单散落在业务页中。
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="space-y-6">
          <ConnectionFormCard
            connection={connection}
            description="在系统内切换 Redmine 实例时，先测试连接，再保存为当前工作区配置。相同实例地址会覆盖原记录。"
            showRememberToggle={false}
            submitLabel="保存并重新连接"
            title="连接配置"
          />

          <SavedInstancesCard
            activeInstanceId={activeInstanceId}
            instances={instances}
            onActivate={activateInstance}
            onRemove={removeInstance}
          />
        </div>

        <Card className="border-outline-variant/10 bg-surface-container/75 shadow-xl shadow-black/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>外观设置</CardTitle>
            <CardDescription>主题切换只调整颜色系统，不改变布局结构与信息密度。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium uppercase tracking-[0.24em] text-on-surface-variant">
                主题模式
              </label>
              <Select value={themeMode} onValueChange={(value) => setThemeMode(value as ThemeMode)}>
                <SelectTrigger className="h-11 w-full bg-surface-container-lowest">
                  <SelectValue placeholder="选择主题模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">暗色</SelectItem>
                  <SelectItem value="light">亮色</SelectItem>
                  <SelectItem value="system">跟随系统</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-4 text-sm text-on-surface-variant">
              当前设置页已收口三项基础能力：主题切换、连接测试、已保存实例切换。API Key 安全存储仍按下一步计划补齐。
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
