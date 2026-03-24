import { MaterialSymbol } from "@/components/material-symbol";
import type { main } from "../../../../wailsjs/go/models";

// Mapping task type/tracker to specific colors/icons
function getTrackerMeta(trackerName: string = "") {
  const name = trackerName.toLowerCase();
  if (name.includes("bug") || name.includes("缺陷") || name.includes("错误")) {
    return { icon: "bug_report", className: "text-error" };
  }
  if (name.includes("feature") || name.includes("功能") || name.includes("需求")) {
    return { icon: "task", className: "text-primary" };
  }
  return { icon: "assignment", className: "text-on-surface-variant" };
}

// Mapping priority to specific colors/tags
function getPriorityMeta(priorityName: string = "") {
  const name = priorityName.toLowerCase();
  if (name.includes("high") || name.includes("高") || name.includes("紧急")) {
    return { label: "High", className: "bg-error-container text-on-error-container" };
  }
  if (name.includes("low") || name.includes("低")) {
    return { label: "Low", className: "bg-surface-variant text-on-surface-variant text-opacity-80" };
  }
  return { label: "Normal", className: "bg-secondary-container text-on-secondary-container" };
}

interface IssuesListPanelProps {
  totalCount: number;
  issues: main.RedmineIssueSummary[];
  statusFilter: string;
  statuses: main.RedmineStatusOption[];
  selectedIssueId: number | null;
  isFetching: boolean;
  onStatusFilterChange: (value: string | null) => void;
  onIssueSelect: (issueId: number) => void;
}

export function IssuesListPanel(props: IssuesListPanelProps) {
  const { totalCount, issues, selectedIssueId, isFetching, onIssueSelect } = props;

  return (
    <section className="flex w-[420px] flex-col border-r border-outline-variant/10 bg-surface z-0 relative">
      <div className="flex items-center justify-between bg-surface-container-low/30 p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-on-surface">
          <span className="h-4 w-1 rounded-full bg-primary"></span>
          指派给我
          <span className="rounded bg-surface-container px-1.5 text-[10px] font-normal text-on-surface-variant">
            {totalCount}
          </span>
        </h2>
        <div className="flex gap-1">
          <button className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high">
            <MaterialSymbol name="filter_list" className="text-sm" opticalSize={20} />
          </button>
          <button className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high">
            <MaterialSymbol name="sort" className="text-sm" opticalSize={20} />
          </button>
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
