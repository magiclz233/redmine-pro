import { PropsWithChildren, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { APP_ROUTE_ITEMS, getRouteMeta } from "@/app/route-config";
import { MaterialSymbol } from "@/components/material-symbol";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  currentUser,
}: PropsWithChildren<{ currentUser: { name: string; login: string } }>) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentRoute = getRouteMeta(location.pathname);
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20">
      {/* Side NavBar */}
      <aside 
        className={cn(
          "relative z-40 flex h-full shrink-0 flex-col border-r border-outline-variant/10 bg-[#141517] transition-[width] duration-300 ease-in-out",
          isSidebarExpanded ? "w-64" : "w-16"
        )}
      >
        <div className={cn("mb-4 flex h-14 items-center px-4", isSidebarExpanded ? "justify-between" : "justify-center")}>
          <div className="flex items-center">
            <div className="flex size-8 shrink-0 items-center justify-center rounded bg-gradient-to-br from-primary to-primary-container">
              <MaterialSymbol name="architecture" filled className="text-sm text-on-primary" opticalSize={20} />
            </div>
            <div className={cn("ml-3 transition-opacity duration-200", isSidebarExpanded ? "opacity-100" : "pointer-events-none opacity-0 w-0 overflow-hidden")}>
              <h1 className="whitespace-nowrap text-sm font-bold tracking-tight text-[#E3E2E4]">Redmine Pro</h1>
            </div>
          </div>
          
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="absolute -right-3 top-16 z-50 rounded-full border border-outline-variant/20 bg-[#1B1C1E] p-0.5 text-on-surface-variant shadow-lg transition-all hover:text-primary"
          >
            <MaterialSymbol 
              name="chevron_right" 
              className={cn("text-lg transition-transform duration-300", isSidebarExpanded && "rotate-180")} 
              opticalSize={20} 
            />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {APP_ROUTE_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "group relative flex h-10 items-center overflow-hidden rounded-md px-2 text-xs font-medium transition-all",
                  isActive
                    ? "border-l-2 border-[#5E6AD2] bg-[#1F2022] text-[#BDC2FF]"
                    : "text-[#C6C5D5] opacity-70 hover:bg-[#292A2C] hover:opacity-100"
                )
              }
              title={item.label}
            >
              <MaterialSymbol name={item.symbol} className="shrink-0 text-[18px]" opticalSize={20} />
              <span className={cn("ml-4 whitespace-nowrap transition-opacity duration-200", isSidebarExpanded ? "opacity-100" : "pointer-events-none opacity-0")}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-outline-variant/10 p-3">
          <button
            className="group mb-2 flex h-10 w-full items-center overflow-hidden rounded-md px-2 text-xs font-medium text-[#C6C5D5] opacity-70 transition-all hover:bg-[#292A2C] hover:opacity-100"
            title="系统设置"
          >
            <MaterialSymbol name="settings" className="shrink-0 text-[18px]" opticalSize={20} />
            <span className={cn("ml-4 whitespace-nowrap transition-opacity duration-200", isSidebarExpanded ? "opacity-100" : "pointer-events-none opacity-0")}>
              系统设置
            </span>
          </button>

          <div className="flex items-center overflow-hidden px-2 py-3">
            <Avatar className="size-6 bg-surface-container-highest">
              <AvatarFallback className="bg-transparent text-[10px] font-semibold text-on-surface">
                {(currentUser.name || "RP").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={cn("ml-3 transition-opacity duration-200", isSidebarExpanded ? "opacity-100" : "pointer-events-none opacity-0 w-0 overflow-hidden")}>
              <p className="truncate whitespace-nowrap text-[11px] font-bold text-on-surface">{currentUser.name || "管理员"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="relative flex flex-1 flex-col h-full bg-surface">
        {/* TopAppBar */}
        <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-outline-variant/5 bg-[#121315] px-6">
          <div className="flex items-center gap-8">
            <span className="text-xl font-black tracking-tight text-[#E3E2E4]">项目管理中心</span>
            <nav className="hidden items-center gap-6 md:flex">
              <a href="#" className="text-sm font-medium text-[#C6C5D5] transition-all hover:text-[#E3E2E4]">活动</a>
              <a href="#" className="text-sm font-medium text-[#C6C5D5] transition-all hover:text-[#E3E2E4]">路线图</a>
              <a href="#" className="border-b-2 border-[#5E6AD2] pb-1 text-sm font-medium text-[#BDC2FF]">问题</a>
              <a href="#" className="text-sm font-medium text-[#C6C5D5] transition-all hover:text-[#E3E2E4]">甘特图</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block group relative">
              <MaterialSymbol
                name="search"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant"
                opticalSize={20}
              />
              <Input
                className="w-48 rounded-lg border-none bg-surface-container-lowest py-1.5 pl-9 pr-4 text-xs shadow-none placeholder:text-on-surface-variant/50 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                placeholder="搜索任务..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="rounded-md p-2 text-on-surface-variant hover:bg-[#1F2022]">
                <MaterialSymbol name="history" className="text-[18px]" opticalSize={20} />
              </Button>
              <Button size="sm" variant="ghost" className="relative rounded-md p-2 text-on-surface-variant hover:bg-[#1F2022]">
                <MaterialSymbol name="notifications" className="text-[18px]" opticalSize={20} />
                <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
              </Button>
              <Button size="sm" className="ml-2 flex items-center gap-2 rounded-md bg-primary-container text-xs font-semibold text-on-primary-container shadow-none hover:bg-primary-container/90 active:scale-95 transition-transform h-8">
                <MaterialSymbol name="file_download" className="text-sm" opticalSize={20} />
                导出数据
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        {children}
      </main>
    </div>
  );
}
