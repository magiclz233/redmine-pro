import { MaterialSymbol } from "@/components/material-symbol";
import type { main } from "../../../../wailsjs/go/models";

// Mapping task type/tracker to specific colors/icons
export function getTrackerMeta(trackerName: string = "") {
  const name = trackerName.toLowerCase();
  if (name.includes("bug") || name.includes("缺陷") || name.includes("错误")) {
    return { icon: "bug_report", className: "text-error" };
  }
  if (name.includes("feature") || name.includes("功能") || name.includes("需求")) {
    return { icon: "task", className: "text-primary" };
  }
  if (name.includes("优化")) {
    return { icon: "description", className: "text-secondary" };
  }
  return { icon: "assignment", className: "text-on-surface-variant" };
}

// Mapping priority to specific colors/tags
export function getPriorityMeta(priorityName: string = "") {
  const name = priorityName.toLowerCase();
  const label = priorityName || "普通";
  if (name.includes("high") || name.includes("高") || name.includes("紧急")) {
    return { label, className: "bg-error-container text-on-error-container" };
  }
  if (name.includes("low") || name.includes("低")) {
    return { label, className: "bg-surface-variant text-on-surface-variant text-opacity-80" };
  }
  return { label, className: "bg-secondary-container text-on-secondary-container" };
}

interface IssuesListPanelProps {
  totalCount: number;
  issues: main.RedmineIssueSummary[];
  statusFilter: string;
  assigneeFilter: string;
  authorFilter: string;
  versionFilter: string;
  projectFilter: string;
  statuses: main.RedmineStatusOption[];
  selectedIssueId: number | null;
  isFetching: boolean;
  onStatusFilterChange: (value: string | null) => void;
  onAssigneeFilterChange: (value: string) => void;
  onAuthorFilterChange: (value: string) => void;
  onVersionFilterChange: (value: string) => void;
  onProjectFilterChange: (value: string) => void;
  onIssueSelect: (issueId: number) => void;
}

export function IssuesListPanel(props: IssuesListPanelProps) {
  const {
    totalCount,
    issues,
    statusFilter,
    assigneeFilter,
    authorFilter,
    versionFilter,
    projectFilter,
    statuses,
    selectedIssueId,
    isFetching,
    onStatusFilterChange,
    onAssigneeFilterChange,
    onAuthorFilterChange,
    onVersionFilterChange,
    onProjectFilterChange,
    onIssueSelect,
  } = props;

  return (
    <section className="flex w-[420px] flex-col border-r border-outline-variant/10 bg-surface z-0 relative">
      <div className="flex flex-col gap-2 bg-surface-container-low/30 px-4 pb-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-on-surface">
            <span className="h-4 w-1 rounded-full bg-primary"></span>
            问题列表
            <span className="rounded bg-surface-container px-1.5 text-[10px] font-normal text-on-surface-variant">
              {totalCount}
            </span>
          </h2>
          <div className="flex gap-1">
            <button className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high">
              <MaterialSymbol name="sort" className="text-sm" opticalSize={20} />
            </button>
            <button 
              onClick={() => {
                onStatusFilterChange("open");
                props.onAssigneeFilterChange("");
                props.onAuthorFilterChange("");
                props.onVersionFilterChange("");
              }}
              className="rounded p-1 text-primary transition-colors hover:bg-primary/10"
              title="重置筛选"
            >
              <MaterialSymbol name="filter_alt_off" className="text-sm" opticalSize={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select 
            value={statusFilter} 
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="rounded border border-outline-variant/20 bg-surface-container-high px-2 py-1 text-[11px] text-on-surface outline-none focus:border-primary/50"
          >
            <option value="open">未关闭 (默认)</option>
            <option value="*">全部状态</option>
            {statuses.map(s => (
              <option key={s.id} value={String(s.id)}>{s.name}</option>
            ))}
          </select>

          <select 
            value={props.assigneeFilter} 
            onChange={(e) => props.onAssigneeFilterChange(e.target.value)}
            className="rounded border border-outline-variant/20 bg-surface-container-high px-2 py-1 text-[11px] text-on-surface outline-none focus:border-primary/50"
          >
            <option value="">指派人: 全部</option>
            <option value="me">指派给我</option>
            <option value="none">未指派</option>
          </select>

          <input 
            type="text"
            placeholder="指派 ID/作者 ID..."
            className="col-span-2 hidden" // 暂时隐藏，后续改进为更好的选择器
          />
        </div>
      </div>

      <div className="custom-scrollbar mt-2 flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-2 pb-4">
        {isFetching && issues.length === 0 ? (
          <div className="p-4 text-center text-xs text-on-surface-variant">加载中...</div>
        ) : null}

        {issues.map((item) => {
          const isSelected = selectedIssueId === item.id;
          const trackerMeta = getTrackerMeta(item.trackerName);
          const priorityMeta = getPriorityMeta(item.priorityName);

          return (
            <div
              key={item.id}
              onClick={() => onIssueSelect(item.id)}
              className={`group cursor-pointer rounded-lg border-l-4 p-3 transition-all ${
                isSelected
                  ? "border-primary bg-surface-container-high"
                  : "border-transparent bg-surface-container hover:bg-surface-container-high"
              }`}
            >
              <div className="mb-1 flex items-start justify-between">
                <span
                  className={`font-mono text-[10px] font-bold ${
                    isSelected ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  #{item.id}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tighter ${priorityMeta.className}`}
                >
                  {priorityMeta.label}
                </span>
              </div>
              
              <h3
                className={`mb-2 text-xs font-semibold leading-snug ${
                  isSelected ? "text-on-surface" : "text-on-surface"
                }`}
              >
                {item.subject}
              </h3>
              
              <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                <div className="flex gap-3">
                  <span className={`flex items-center gap-1 ${trackerMeta.className}`}>
                    <MaterialSymbol name={trackerMeta.icon} className="text-[12px]" opticalSize={20} />
                    {item.trackerName || "任务"}
                  </span>
                  {item.updatedOn ? (
                    <span className="flex items-center gap-1">
                      <MaterialSymbol name="history" className="text-[12px]" opticalSize={20} />
                      {item.updatedOn.slice(0, 10)}
                    </span>
                  ) : null}
                </div>
                
                <button 
                  className={`transition-opacity text-primary ${isSelected ? "opacity-100 font-medium" : "opacity-0 group-hover:opacity-100"}`}
                >
                  {isSelected ? "查看详情" : "View"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
