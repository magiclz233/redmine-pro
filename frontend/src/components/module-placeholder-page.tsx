import { ArrowRightIcon, DraftingCompassIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ModulePlaceholderPageProps {
  title: string;
  description: string;
  stitch: string;
  phase: string;
  nextTask: string;
}

export function ModulePlaceholderPage({
  title,
  description,
  stitch,
  phase,
  nextTask,
}: ModulePlaceholderPageProps) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-5 md:px-8 md:py-8">
      <section className="rounded-2xl border border-outline-variant/20 bg-surface-container/85 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{phase}</Badge>
          <Badge variant="outline">{stitch}</Badge>
          <Badge variant="outline">路由骨架已接入</Badge>
        </div>
        <div className="mt-4 space-y-2">
          <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
          <p className="max-w-3xl text-sm text-on-surface-variant">{description}</p>
        </div>
      </section>

      <Card className="border border-outline-variant/20 bg-surface-container shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <DraftingCompassIcon className="size-5" />
            </div>
            <div className="space-y-1">
              <CardTitle>页面骨架已就位</CardTitle>
              <CardDescription>
                当前迭代只完成路由落位和模块入口，后续页面会按 Stitch 稿件逐步替换。
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low p-4 text-sm text-on-surface-variant">
            <p>下一步任务</p>
            <p className="mt-2 text-base font-medium text-foreground">{nextTask}</p>
          </div>
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-high/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
              迭代边界
            </p>
            <div className="mt-3 flex items-start gap-2 text-sm text-foreground">
              <ArrowRightIcon className="mt-0.5 size-4 text-primary" />
              <span>遵循开发计划，仅做当前模块入口，不提前实现未排期的交互。</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
