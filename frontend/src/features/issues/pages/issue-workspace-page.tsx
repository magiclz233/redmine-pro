import { CheckCircle2Icon, RefreshCwIcon, UserCircle2Icon } from "lucide-react";
import { MaterialSymbol } from "@/components/material-symbol";
import { ErrorState } from "@/components/states/feedback-state";
import { IssueDetailPanel } from "@/features/issues/components/issue-detail-panel";
import { IssuesListPanel } from "@/features/issues/components/issues-list-panel";
import { useIssueWorkspace } from "@/features/issues/hooks/use-issue-workspace";

export function IssueWorkspacePage() {
  const workspace = useIssueWorkspace();

  return (
    <main className="flex flex-1 overflow-hidden bg-surface relative">
      {workspace.errorMessage ? (
        <div className="absolute right-6 top-6 z-50 w-96 shadow-2xl">
          <ErrorState
            title="数据加载失败"
            description={workspace.errorMessage}
            actionLabel="重新加载"
            onAction={workspace.onRefresh}
          />
        </div>
      ) : null}

      {workspace.actionMessage ? (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 shadow-2xl flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          <CheckCircle2Icon className="size-4" />
          {workspace.actionMessage}
        </div>
      ) : null}

      {/* Master-Detail Container */}
        <IssuesListPanel
          totalCount={workspace.issuesQuery.data?.totalCount ?? 0}
          issues={workspace.issues}
          statusFilter={workspace.statusFilter}
          statuses={workspace.statusListQuery.data ?? []}
          selectedIssueId={workspace.selectedIssueId}
          isFetching={workspace.issuesQuery.isFetching}
          onStatusFilterChange={workspace.onStatusFilterChange}
          onIssueSelect={(issueId) => {
            workspace.setSelectedIssueId(issueId);
            workspace.setActionMessage("");
          }}
        />

        <IssueDetailPanel
          selectedIssueId={workspace.selectedIssueId}
          issueDetail={workspace.issueDetailQuery.data}
          availableStatuses={workspace.availableStatuses}
          projectMembers={workspace.projectMembersQuery.data ?? []}
          statusToUpdate={workspace.statusToUpdate}
          assigneeId={workspace.assigneeId}
          notes={workspace.notes}
          isDetailFetching={workspace.issueDetailQuery.isFetching}
          isUpdatePending={workspace.updateStatusMutation.isPending}
          isAssignPending={workspace.assignIssueMutation.isPending}
          onStatusToUpdateChange={workspace.onStatusToUpdateChange}
          onAssigneeChange={workspace.onAssigneeChange}
          onAssigneeInputChange={workspace.setAssigneeId}
          onNotesChange={workspace.setNotes}
          onUpdateStatus={() => workspace.updateStatusMutation.mutate()}
          onAssignIssue={() => workspace.assignIssueMutation.mutate()}
        />
    </main>
  );
}
