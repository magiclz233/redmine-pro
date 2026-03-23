import {
  CheckCircle2Icon,
  Loader2Icon,
  RefreshCwIcon,
  UserCircle2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConnectionCard } from "@/features/issues/components/connection-card";
import { IssueDetailPanel } from "@/features/issues/components/issue-detail-panel";
import { IssuesListPanel } from "@/features/issues/components/issues-list-panel";
import { useIssueWorkspace } from "@/features/issues/hooks/use-issue-workspace";

export function IssueWorkspacePage() {
  const workspace = useIssueWorkspace();

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl space-y-4 px-4 py-5 md:space-y-6 md:px-8 md:py-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/85 p-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold md:text-2xl">Redmine Pro</h1>
          <p className="text-sm text-muted-foreground">
            已接入真实 Redmine API：我的问题列表、详情、状态更新、指派。
          </p>
          {workspace.currentUserQuery.data ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCircle2Icon className="size-4" />
              当前用户：{workspace.currentUserQuery.data.name} (
              {workspace.currentUserQuery.data.login || "-"})
            </div>
          ) : null}
        </div>
        <Button
          variant="outline"
          onClick={workspace.onRefresh}
          disabled={!workspace.hasCredentials || workspace.issuesQuery.isFetching}
        >
          {workspace.issuesQuery.isFetching ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <RefreshCwIcon className="size-4" />
          )}
          刷新数据
        </Button>
      </header>

      <ConnectionCard
        draftUrl={workspace.draftUrl}
        draftApiKey={workspace.draftApiKey}
        saveMessage={workspace.saveMessage}
        onDraftUrlChange={workspace.setDraftUrl}
        onDraftApiKeyChange={workspace.setDraftApiKey}
        onSave={workspace.onSaveCredentials}
      />

      {workspace.errorMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {workspace.errorMessage}
        </div>
      ) : null}

      {workspace.actionMessage ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          <CheckCircle2Icon className="size-4" />
          {workspace.actionMessage}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
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
      </section>
    </main>
  );
}
