import { CheckCircle2Icon } from "lucide-react";
import { ErrorState } from "@/components/states/feedback-state";
import { IssueDetailPanel } from "@/features/issues/components/issue-detail-panel";
import { IssuesListPanel } from "@/features/issues/components/issues-list-panel";
import { useIssueWorkspace } from "@/features/issues/hooks/use-issue-workspace";

export function IssueWorkspacePage() {
  const workspace = useIssueWorkspace();

  return (
    <main className="relative flex flex-1 overflow-hidden bg-surface">
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
        <div className="absolute left-1/2 top-6 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary shadow-2xl">
          <CheckCircle2Icon className="size-4" />
          {workspace.actionMessage}
        </div>
      ) : null}

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
        issueEditMeta={workspace.issueEditMetaQuery.data}
        editForm={workspace.editForm}
        getCustomFieldValues={workspace.getCustomFieldValues}
        isDetailFetching={workspace.issueDetailQuery.isFetching}
        isEditMetaFetching={workspace.issueEditMetaQuery.isFetching}
        isSavePending={workspace.saveIssueMutation.isPending}
        onEditFieldChange={workspace.onEditFieldChange}
        onCustomFieldValueChange={workspace.onCustomFieldValueChange}
        onCustomFieldValuesChange={workspace.onCustomFieldValuesChange}
        onSaveIssue={workspace.onSaveIssue}
      />
    </main>
  );
}