import { useState } from "react";
import { MaterialSymbol } from "@/components/material-symbol";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import type { main } from "../../../../wailsjs/go/models";
import { getTrackerMeta, getPriorityMeta } from "./issues-list-panel";

interface IssueDetailPanelProps {
  selectedIssueId: number | null;
  issueDetail?: main.RedmineIssueDetail;
  availableStatuses: main.RedmineStatusOption[];
  projectMembers: main.RedmineUserOption[];
  statusToUpdate: string;
  assigneeId: string;
  notes: string;
  isDetailFetching: boolean;
  isUpdatePending: boolean;
  isAssignPending: boolean;
  onStatusToUpdateChange: (value: string | null) => void;
  onAssigneeChange: (value: string | null) => void;
  onAssigneeInputChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onUpdateStatus: () => void;
  onAssignIssue: () => void;
}

export function IssueDetailPanel(props: IssueDetailPanelProps) {
  const {
    selectedIssueId,
    issueDetail,
    availableStatuses,
    projectMembers,
    statusToUpdate,
    assigneeId,
    notes,
    isDetailFetching,
    isUpdatePending,
    isAssignPending,
    onStatusToUpdateChange,
    onAssigneeChange,
    onNotesChange,
    onUpdateStatus,
    onAssignIssue,
  } = props;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!selectedIssueId) {
    return (
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-surface-container-lowest">
        <MaterialSymbol name="assignment" opticalSize={48} className="mb-4 text-5xl text-outline-variant/40" />
        <p className="text-sm text-on-surface-variant">请在左侧选择一个任务查看详情</p>
      </section>
    );
  }

  if (isDetailFetching && !issueDetail) {
    return (
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-surface-container-lowest">
        <MaterialSymbol name="progress_activity" opticalSize={48} className="mb-4 text-4xl animate-spin text-primary" />
        <p className="text-sm text-on-surface-variant">正在加载任务详情...</p>
      </section>
    );
  }

  if (!issueDetail) {
    return (
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-surface-container-lowest">
        <p className="text-sm text-destructive">未获取到问题详情数据</p>
      </section>
    );
  }

  const { issue } = issueDetail;

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-surface-container-lowest">
      {/* Detail Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-outline-variant/5 px-8 py-4 glass-panel">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="mb-0.5 flex items-center gap-2">
              <span className="text-xs font-bold text-primary">#{issue.id}</span>
              <span className="rounded bg-secondary-container px-1.5 py-0.5 text-[10px] font-semibold text-on-secondary-container uppercase">
                {issue.statusName || "未知状态"}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-on-surface">{issue.subject}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-container px-4 py-1.5 text-xs font-bold text-on-primary-container transition-all hover:brightness-110 active:scale-95"
          >
            <MaterialSymbol name="edit" className="text-sm" opticalSize={20} />
            编辑问题
          </button>
          <button className="rounded p-1.5 text-on-surface-variant hover:bg-surface-container-high transition-all">
            <MaterialSymbol name="more_horiz" opticalSize={20} />
          </button>
        </div>
      </div>

      {/* Detail Content */}
      <div className="custom-scrollbar flex flex-col gap-8 overflow-y-auto px-8 py-8">
        
        {/* Metadata Grid */}
        <div className="grid grid-cols-4 gap-x-6 gap-y-4 rounded-xl border border-outline-variant/10 bg-surface-container p-6 shadow-xl">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">项目</p>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary/40"></span>
              <p className="text-sm font-medium text-on-surface">{issue.projectName || "-"}</p>
            </div>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">负责人</p>
            <div className="flex items-center gap-2">
              <Avatar className="size-5 bg-surface-variant">
                <AvatarFallback className="bg-transparent text-[8px] font-bold text-on-surface-variant">
                  <MaterialSymbol name="person" className="scale-75" />
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-on-surface">{issue.assigneeName || "未指派"}</p>
            </div>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">类型</p>
            <div className={`flex items-center gap-2 ${getTrackerMeta(issue.trackerName).className}`}>
              <MaterialSymbol name={getTrackerMeta(issue.trackerName).icon} className="text-[14px]" opticalSize={20} />
              <p className="text-sm font-medium text-on-surface">{issue.trackerName || "-"}</p>
            </div>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">优先级</p>
            <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter ${getPriorityMeta(issue.priorityName).className}`}>
              {getPriorityMeta(issue.priorityName).label}
            </span>
          </div>
          
          <div className="col-span-4 my-2 h-px bg-outline-variant/10"></div>
          
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">创建时间</p>
            <p className="text-sm font-medium text-on-surface">{issue.createdOn ? issue.createdOn.slice(0,10) : "-"}</p>
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">更新时间</p>
            <p className="text-sm font-medium text-primary">{issue.updatedOn ? issue.updatedOn.slice(0,10) : "-"}</p>
          </div>
          <div className="col-span-2">
             <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">完成进度</p>
             <p className="text-sm font-medium text-on-surface-variant/40">暂不支持统计比</p>
          </div>
        </div>

        {/* Description Section */}
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2">
            <MaterialSymbol name="description" className="text-on-surface-variant" opticalSize={20} />
            <h3 className="text-sm font-bold text-on-surface">问题描述</h3>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-on-surface-variant">
            <p className="whitespace-pre-wrap">{issueDetail.description || "没有提供详细描述。"}</p>
          </div>
        </div>
      </div>

      {/* Editing Drawer (Shadcn Sheet Overlay) */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="flex w-full max-w-[420px] flex-col border-l border-outline-variant/10 bg-surface-container-lowest p-0 shadow-2xl sm:max-w-[420px]">
          <SheetDescription className="hidden">Edit issue details</SheetDescription>
          <div className="glass-panel flex items-center border-b border-outline-variant/10 p-6 pr-12">
            <SheetTitle className="text-lg font-bold tracking-tight text-on-surface">
              编辑问题 #{issue.id}
            </SheetTitle>
          </div>
          
          <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">任务状态流转</label>
            <div className="flex gap-2">
              <Select value={statusToUpdate} onValueChange={onStatusToUpdateChange}>
                <SelectTrigger className="h-9 border-none bg-surface-container text-xs text-on-surface focus:ring-1 focus:ring-primary/40 focus:ring-offset-0">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                className="h-9 rounded-lg bg-primary-container text-primary-container-foreground hover:bg-primary-container/90 px-4 text-xs font-semibold shadow-none"
                onClick={() => {
                  onUpdateStatus();
                  setIsDrawerOpen(false);
                }}
                disabled={isUpdatePending}
              >
                {isUpdatePending ? <MaterialSymbol name="progress_activity" className="animate-spin text-sm" opticalSize={20} /> : "更新"}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">指派接收人</label>
            <div className="flex gap-2">
              <Select value={assigneeId} onValueChange={onAssigneeChange}>
                <SelectTrigger className="h-9 border-none bg-surface-container text-xs text-on-surface focus:ring-1 focus:ring-primary/40 focus:ring-offset-0">
                  <SelectValue placeholder="选择负责人" />
                </SelectTrigger>
                <SelectContent>
                  {projectMembers.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                className="h-9 rounded-lg bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 px-4 text-xs font-semibold shadow-none"
                onClick={() => {
                  onAssignIssue();
                  setIsDrawerOpen(false);
                }}
                disabled={isAssignPending}
              >
                {isAssignPending ? <MaterialSymbol name="progress_activity" className="animate-spin text-sm" opticalSize={20} /> : "转交"}
              </Button>
            </div>
          </div>

          <div className="h-px bg-outline-variant/10 w-full my-4"></div>

          <div className="space-y-3">
             <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">追加任务备注 (操作均可带上)</label>
             <Textarea
                className="min-h-32 resize-none border-outline-variant/20 bg-surface-container px-4 py-3 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-primary/40 placeholder:text-outline-variant/50"
                placeholder="在此输入新的详情进展或沟通意见..."
                value={notes}
                onChange={(event) => onNotesChange(event.target.value)}
             />
          </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
