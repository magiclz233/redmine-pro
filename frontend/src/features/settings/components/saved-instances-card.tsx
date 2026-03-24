import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialSymbol } from "@/components/material-symbol";
import { type RedmineInstanceProfile } from "@/stores/use-app-store";

interface SavedInstancesCardProps {
  activeInstanceId: string | null;
  instances: RedmineInstanceProfile[];
  onActivate: (instanceId: string) => void;
  onRemove: (instanceId: string) => void;
}

function formatConnectedAt(value: string) {
  if (!value) {
    return "尚未记录";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "尚未记录";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function SavedInstancesCard({
  activeInstanceId,
  instances,
  onActivate,
  onRemove,
}: SavedInstancesCardProps) {
  return (
    <Card className="border-outline-variant/10 bg-surface-container/75 shadow-xl shadow-black/10 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>已保存实例</CardTitle>
        <CardDescription>连接测试通过的实例会保存在本地，可在这里快速切换当前工作区。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {instances.length ? (
          instances.map((instance) => {
            const isActive = instance.id === activeInstanceId;

            return (
              <div
                key={instance.id}
                className="rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-on-surface">{instance.label}</p>
                      {isActive ? <Badge variant="secondary">当前实例</Badge> : null}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                      <MaterialSymbol name="link" className="text-[16px]" opticalSize={20} />
                      <span className="truncate font-mono">{instance.redmineBaseUrl}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-on-surface-variant">
                      <span>
                        用户：{instance.lastUserName || "-"}
                        {instance.lastUserLogin ? ` (${instance.lastUserLogin})` : ""}
                      </span>
                      <span className="font-mono">最近连接：{formatConnectedAt(instance.lastConnectedAt)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant={isActive ? "secondary" : "outline"}
                      onClick={() => onActivate(instance.id)}
                    >
                      <MaterialSymbol name="swap_horiz" className="text-[16px]" opticalSize={20} />
                      {isActive ? "使用中" : "切换"}
                    </Button>

                    <Button type="button" variant="ghost" onClick={() => onRemove(instance.id)}>
                      <MaterialSymbol name="delete" className="text-[16px]" opticalSize={20} />
                      删除
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-low px-4 py-6 text-sm text-on-surface-variant">
            还没有保存过其他实例。先通过连接测试并保存当前配置，之后就可以在这里切换。
          </div>
        )}
      </CardContent>
    </Card>
  );
}
