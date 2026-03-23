import type { PropsWithChildren } from "react";

// AppShell 是应用级布局壳层。
// 当前版本先提供统一的页面容器，后续再逐步接入 Stitch 稿中的侧栏、顶栏和底部状态栏。
export function AppShell({ children }: PropsWithChildren) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
