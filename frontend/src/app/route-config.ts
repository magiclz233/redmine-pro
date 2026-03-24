export interface AppRouteItem {
  path: string;
  label: string;
  description: string;
  stitch: string;
  phase: string;
  symbol: string;
}

export const DEFAULT_ROUTE_PATH = "/dashboard";

export const APP_ROUTE_ITEMS: AppRouteItem[] = [
  {
    path: "/dashboard",
    label: "工作台",
    description: "我的问题摘要与快捷入口",
    stitch: "stitch_2.html",
    phase: "Phase 2",
    symbol: "dashboard",
  },
  {
    path: "/issues",
    label: "任务中心",
    description: "问题列表、详情与高频处理入口",
    stitch: "stitch_3.html",
    phase: "Phase 3",
    symbol: "assignment",
  },
  {
    path: "/analytics",
    label: "研发看板",
    description: "统计分析与组长视角报表",
    stitch: "stitch_4.html",
    phase: "Phase 6",
    symbol: "analytics",
  },
  {
    path: "/time-entries",
    label: "工时日志",
    description: "我的工时记录、日报与月报",
    stitch: "stitch_5.html",
    phase: "Phase 4",
    symbol: "history_toggle_off",
  },
  {
    path: "/projects",
    label: "项目版本",
    description: "项目树、版本与成员管理",
    stitch: "stitch_6.html",
    phase: "Phase 5",
    symbol: "account_tree",
  },
  {
    path: "/settings",
    label: "设置",
    description: "外观、连接与本地增强设置",
    stitch: "stitch_7.html",
    phase: "Phase 7",
    symbol: "settings",
  },
];

export function getRouteMeta(pathname: string) {
  return APP_ROUTE_ITEMS.find((item) => item.path === pathname);
}
