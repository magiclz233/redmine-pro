import { MaterialSymbol } from "@/components/material-symbol";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function DashboardPage() {
  return (
    <div className="grid w-full grid-cols-12 gap-6 animate-in fade-in duration-300">
      {/* Core Metrics Bento */}
      <div className="col-span-12 mb-2 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="group gap-0 p-4 py-4 transition-all hover:border-outline-variant/60">
          <div className="mb-2 flex items-start justify-between px-0">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant">指派给我</span>
            <MaterialSymbol name="person" className="text-primary transition-transform group-hover:scale-110" opticalSize={20} />
          </div>
          <div className="font-mono text-3xl font-bold text-primary px-0 pb-0">14</div>
          <div className="mt-2 flex items-center gap-1 px-0 text-[10px] text-on-surface-variant">
            <span className="text-destructive">↑ 2</span> 较昨日新增
          </div>
        </Card>

        <Card className="group gap-0 p-4 py-4 transition-all hover:border-outline-variant/60">
          <div className="mb-2 flex items-start justify-between px-0">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant">待处理</span>
            <MaterialSymbol name="pending_actions" className="text-tertiary transition-transform group-hover:scale-110" opticalSize={20} />
          </div>
          <div className="font-mono text-3xl font-bold text-tertiary px-0 pb-0">3</div>
          <div className="mt-2 flex items-center gap-1 px-0 text-[10px] text-on-surface-variant">需尽快排期</div>
        </Card>

        <Card className="group gap-0 p-4 py-4 transition-all hover:border-outline-variant/60">
          <div className="mb-2 flex items-start justify-between px-0">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant">今日耗时</span>
            <MaterialSymbol name="timer" className="text-secondary transition-transform group-hover:scale-110" opticalSize={20} />
          </div>
          <div className="font-mono text-3xl font-bold text-on-surface px-0 pb-0">06:45</div>
          <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high px-0">
            <div className="w-[84%] bg-primary" />
          </div>
        </Card>

        <Card className="group gap-0 p-4 py-4 transition-all hover:border-outline-variant/60">
          <div className="mb-2 flex items-start justify-between px-0">
            <span className="text-xs uppercase tracking-wider text-on-surface-variant">系统负载</span>
            <MaterialSymbol name="memory" className="text-outline-variant transition-transform group-hover:scale-110" opticalSize={20} />
          </div>
          <div className="space-y-2 pt-1 px-0 pb-0">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-on-surface-variant">CPU</span>
              <span className="text-primary">42%</span>
            </div>
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-on-surface-variant">MEM</span>
              <span className="text-secondary">6.2GB</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Task List & Milestones Main */}
      <div className="col-span-12 space-y-4 lg:col-span-9">
        <div className="flex items-end justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-on-surface">指派给我的任务</h2>
          <div className="flex gap-2">
            <button className="rounded bg-surface-container-high px-2 py-1 text-[10px] text-on-surface-variant transition-colors hover:text-on-surface">
              全部任务
            </button>
            <button className="rounded bg-surface-container-high px-2 py-1 text-[10px] text-on-surface-variant transition-colors hover:text-on-surface">
              仅超期
            </button>
          </div>
        </div>

        <Card className="overflow-hidden p-0 py-0 gap-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low text-on-surface-variant/70">
                  <th className="px-5 py-3.5 font-medium">任务 #</th>
                  <th className="px-5 py-3.5 font-medium">标题</th>
                  <th className="px-5 py-3.5 font-medium">优先级</th>
                  <th className="px-5 py-3.5 font-medium">状态</th>
                  <th className="px-5 py-3.5 font-medium">截止日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                <tr className="group transition-colors hover:bg-surface-container-high">
                  <td className="px-5 py-4 font-mono text-outline">#4029</td>
                  <td className="px-5 py-4 font-medium text-on-surface transition-colors group-hover:text-primary">
                    重构工作台侧边栏导航逻辑
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="destructive" className="bg-destructive/10 text-destructive border-none shadow-none text-[10px] rounded hover:bg-destructive/20 transition-sleek font-semibold">
                      紧急
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> 进行中
                    </span>
                  </td>
                  <td className="font-mono font-medium text-destructive px-5 py-4">2024-06-15 (超期)</td>
                </tr>

                <tr className="group transition-colors hover:bg-surface-container-high">
                  <td className="px-5 py-4 font-mono text-outline">#3984</td>
                  <td className="px-5 py-4 font-medium text-on-surface transition-colors group-hover:text-primary">
                    API 接口性能瓶颈分析
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="default" className="bg-tertiary/10 text-tertiary border-none shadow-none text-[10px] rounded hover:bg-tertiary/20 transition-sleek font-semibold">
                      高
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-surface-variant" /> 待处理
                    </span>
                  </td>
                  <td className="font-mono text-on-surface-variant px-5 py-4">2024-06-22</td>
                </tr>

                <tr className="group transition-colors hover:bg-surface-container-high">
                  <td className="px-5 py-4 font-mono text-outline">#4102</td>
                  <td className="px-5 py-4 font-medium text-on-surface transition-colors group-hover:text-primary">
                    修复 PDF 导出在多语言环境下的乱码问题
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="secondary" className="bg-secondary-container/30 text-secondary border-none shadow-none text-[10px] rounded hover:bg-secondary-container/50 transition-sleek font-semibold">
                      普通
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" /> 进行中
                    </span>
                  </td>
                  <td className="font-mono text-on-surface-variant px-5 py-4">2024-06-25</td>
                </tr>

                <tr className="group transition-colors hover:bg-surface-container-high">
                  <td className="px-5 py-4 font-mono text-outline">#4128</td>
                  <td className="px-5 py-4 font-medium text-on-surface transition-colors group-hover:text-primary">
                    同步 JIRA 数据到 Redmine 镜像库
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className="border-none bg-outline-variant/20 shadow-none text-[10px] text-on-surface-variant rounded hover:bg-outline-variant/30 transition-sleek font-semibold">
                      低
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-surface-variant" /> 待处理
                    </span>
                  </td>
                  <td className="font-mono text-on-surface-variant px-5 py-4">2024-06-30</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Milestone Progress */}
        <div className="mt-8 space-y-4">
          <h2 className="text-sm font-semibold tracking-tight text-on-surface">关键里程碑进度</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5 py-5 gap-0">
              <div className="mb-4 flex items-center justify-between px-0">
                <span className="text-xs font-medium">v2.4.0 核心重构</span>
                <span className="font-mono text-xs text-primary">72%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low px-0">
                <div className="h-full w-[72%] bg-primary" />
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-outline px-0 pb-0">
                <span>截止: 07-15</span>
                <span>12 剩余任务</span>
              </div>
            </Card>

            <Card className="p-5 py-5 gap-0">
              <div className="mb-4 flex items-center justify-between px-0">
                <span className="text-xs font-medium">自动化测试覆盖</span>
                <span className="font-mono text-xs text-secondary">45%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low px-0">
                <div className="h-full w-[45%] bg-secondary" />
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-outline px-0 pb-0">
                <span>截止: 08-01</span>
                <span>8 剩余任务</span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="col-span-12 space-y-6 lg:col-span-3">
        {/* Mini Calendar */}
        <Card className="p-5 py-5 gap-0">
          <div className="mb-4 flex items-center justify-between px-0">
            <h3 className="text-xs font-bold text-on-surface">2024年 6月</h3>
            <div className="flex gap-2">
              <MaterialSymbol name="chevron_left" className="cursor-pointer text-sm text-outline hover:text-on-surface" opticalSize={20} />
              <MaterialSymbol name="chevron_right" className="cursor-pointer text-sm text-outline hover:text-on-surface" opticalSize={20} />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] px-0 pb-0">
            <span className="py-1 text-outline-variant">一</span>
            <span className="py-1 text-outline-variant">二</span>
            <span className="py-1 text-outline-variant">三</span>
            <span className="py-1 text-outline-variant">四</span>
            <span className="py-1 text-outline-variant">五</span>
            <span className="py-1 text-outline-variant">六</span>
            <span className="py-1 text-outline-variant">日</span>
            {/* Calendar Days */}
            <span className="p-2 text-outline-variant/30">27</span>
            <span className="p-2 text-outline-variant/30">28</span>
            <span className="p-2 text-outline-variant/30">29</span>
            <span className="p-2 text-outline-variant/30">30</span>
            <span className="p-2 text-outline-variant/30">31</span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">1</span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">2</span>
            {/* ... abbreviated inner days for brevity but keeping structure ... */}
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">3</span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">4</span>
            <span className="relative cursor-pointer rounded p-2 text-on-surface hover:bg-surface-container-high transition-colors">
              5<span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
            </span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">6</span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">7</span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">8</span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">9</span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">10</span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">11</span>
            <span className="relative cursor-pointer rounded p-2 text-on-surface hover:bg-surface-container-high transition-colors">
              12<span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-tertiary" />
            </span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">13</span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">14</span>
            <span className="relative cursor-pointer rounded bg-primary/20 font-bold text-primary transition-colors">
              15<span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
            </span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">16</span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">17</span>
            <span className="relative cursor-pointer rounded p-2 text-on-surface hover:bg-surface-container-high transition-colors">
              18<span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
            </span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">19</span>
            <span className="relative cursor-pointer rounded p-2 text-on-surface hover:bg-surface-container-high transition-colors">
              20<span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-secondary" />
            </span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">21</span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">22</span>
            <span className="cursor-pointer p-2 rounded text-on-surface hover:bg-surface-container-high transition-colors">23</span>
          </div>
        </Card>

        {/* Project Quick Links */}
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-outline-variant">常用项目</h3>
          <div className="space-y-2">
            <div className="group flex cursor-pointer items-center gap-3 rounded p-1.5 transition-all hover:bg-surface-container-high">
              <span className="h-2 w-2 rounded bg-primary-container" />
              <span className="text-xs text-on-surface-variant group-hover:text-on-surface">Redmine NextGen</span>
            </div>
            <div className="group flex cursor-pointer items-center gap-3 rounded p-1.5 transition-all hover:bg-surface-container-high">
              <span className="h-2 w-2 rounded bg-tertiary" />
              <span className="text-xs text-on-surface-variant group-hover:text-on-surface">Ops Automation</span>
            </div>
            <div className="group flex cursor-pointer items-center gap-3 rounded p-1.5 transition-all hover:bg-surface-container-high">
              <span className="h-2 w-2 rounded bg-destructive" />
              <span className="text-xs text-on-surface-variant group-hover:text-on-surface">Hotfix 2024Q2</span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline-variant">最近活动</h3>
          <div className="relative space-y-4 pl-4 before:absolute before:bottom-1 before:left-0 before:top-1 before:w-px before:bg-outline-variant/20 before:content-['']">
            <div className="relative">
              <span className="absolute -left-[20px] top-1 h-2 w-2 rounded-full border-2 border-background bg-primary" />
              <div className="text-[10px] text-on-surface-variant">10 分钟前</div>
              <div className="text-[11px] text-on-surface">
                你 更新了任务 <span className="text-primary">#4029</span> 的状态为 [进行中]
              </div>
            </div>
            <div className="relative">
              <span className="absolute -left-[20px] top-1 h-2 w-2 rounded-full border-2 border-background bg-outline-variant" />
              <div className="text-[10px] text-on-surface-variant">2 小时前</div>
              <div className="text-[11px] text-on-surface">
                Zack 指派了 <span className="text-primary">#4128</span> 给你
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
