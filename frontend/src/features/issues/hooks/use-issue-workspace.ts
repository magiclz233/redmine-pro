import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  assignIssue,
  getCurrentUser,
  getIssueDetail,
  getIssueStatuses,
  getMyIssues,
  getProjectMembers,
  updateIssueStatus,
} from "@/services/redmine";
import { useAppStore } from "@/stores/use-app-store";

// useIssueWorkspace 统一承载任务中心工作区的数据访问与页面状态。
// 这样做可以把页面组件从查询、筛选、状态流转等细节中剥离出来，便于后续继续拆分为更多业务组件。
export function useIssueWorkspace() {
  const redmineBaseUrl = useAppStore((state) => state.redmineBaseUrl);
  const apiKey = useAppStore((state) => state.apiKey);
  const statusFilter = useAppStore((state) => state.statusFilter);
  const setStatusFilter = useAppStore((state) => state.setStatusFilter);

  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [notes, setNotes] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const credentials = useMemo(
    () => ({ baseUrl: redmineBaseUrl, apiKey }),
    [redmineBaseUrl, apiKey]
  );
  const hasCredentials = Boolean(redmineBaseUrl.trim() && apiKey.trim());

  const currentUserQuery = useQuery({
    queryKey: ["current-user", redmineBaseUrl, apiKey],
    queryFn: () => getCurrentUser(credentials),
    enabled: hasCredentials,
    staleTime: 60_000,
  });

  const statusListQuery = useQuery({
    queryKey: ["issue-statuses", redmineBaseUrl, apiKey],
    queryFn: () => getIssueStatuses(credentials),
    enabled: hasCredentials,
    staleTime: 5 * 60_000,
  });

  const issuesQuery = useQuery({
    queryKey: ["my-issues", redmineBaseUrl, apiKey, statusFilter],
    queryFn: () => getMyIssues(credentials, { statusId: statusFilter, limit: 50, offset: 0 }),
    enabled: hasCredentials,
    staleTime: 30_000,
  });

  const issues = issuesQuery.data?.issues ?? [];

  useEffect(() => {
    if (!issues.length) {
      setSelectedIssueId(null);
      return;
    }

    if (selectedIssueId === null || !issues.some((item) => item.id === selectedIssueId)) {
      setSelectedIssueId(issues[0].id);
    }
  }, [issues, selectedIssueId]);

  const issueDetailQuery = useQuery({
    queryKey: ["issue-detail", redmineBaseUrl, apiKey, selectedIssueId],
    queryFn: () => getIssueDetail(credentials, selectedIssueId as number),
    enabled: hasCredentials && selectedIssueId !== null,
  });

  const projectId = issueDetailQuery.data?.issue.projectId ?? 0;
  const projectMembersQuery = useQuery({
    queryKey: ["project-members", redmineBaseUrl, apiKey, projectId],
    queryFn: () => getProjectMembers(credentials, projectId),
    enabled: hasCredentials && projectId > 0,
    staleTime: 60_000,
  });

  const availableStatuses =
    issueDetailQuery.data?.allowedStatuses?.length
      ? issueDetailQuery.data.allowedStatuses
      : statusListQuery.data ?? [];

  useEffect(() => {
    const detail = issueDetailQuery.data;
    if (!detail) {
      return;
    }

    setStatusToUpdate(String(detail.issue.statusId || ""));
    setAssigneeId(detail.issue.assigneeId > 0 ? String(detail.issue.assigneeId) : "");
  }, [issueDetailQuery.data]);

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      const issueId = selectedIssueId;
      const nextStatusId = Number(statusToUpdate);

      if (!issueId) {
        throw new Error("请先选择问题");
      }
      if (!nextStatusId) {
        throw new Error("请选择状态");
      }

      return updateIssueStatus(credentials, issueId, nextStatusId, notes);
    },
    onSuccess: async (message) => {
      setActionMessage(message);
      await Promise.all([issuesQuery.refetch(), issueDetailQuery.refetch()]);
    },
  });

  const assignIssueMutation = useMutation({
    mutationFn: async () => {
      const issueId = selectedIssueId;
      const nextAssigneeId = Number(assigneeId);

      if (!issueId) {
        throw new Error("请先选择问题");
      }
      if (!nextAssigneeId) {
        throw new Error("请先选择或输入指派人 ID");
      }

      return assignIssue(credentials, issueId, nextAssigneeId, notes);
    },
    onSuccess: async (message) => {
      setActionMessage(message);
      await Promise.all([issuesQuery.refetch(), issueDetailQuery.refetch()]);
    },
  });

  const onRefresh = async () => {
    setActionMessage("");
    await Promise.all([
      currentUserQuery.refetch(),
      statusListQuery.refetch(),
      issuesQuery.refetch(),
      issueDetailQuery.refetch(),
    ]);
  };

  const onStatusFilterChange = (value: string | null) => {
    setStatusFilter(value ?? "*");
    setSelectedIssueId(null);
    setActionMessage("");
  };

  const onStatusToUpdateChange = (value: string | null) => {
    setStatusToUpdate(value ?? "");
  };

  const onAssigneeChange = (value: string | null) => {
    setAssigneeId(value ?? "");
  };

  const errorMessage =
    currentUserQuery.error instanceof Error
      ? currentUserQuery.error.message
      : statusListQuery.error instanceof Error
        ? statusListQuery.error.message
        : issuesQuery.error instanceof Error
          ? issuesQuery.error.message
          : issueDetailQuery.error instanceof Error
            ? issueDetailQuery.error.message
            : updateStatusMutation.error instanceof Error
              ? updateStatusMutation.error.message
              : assignIssueMutation.error instanceof Error
                ? assignIssueMutation.error.message
                : "";

  return {
    redmineBaseUrl,
    apiKey,
    selectedIssueId,
    statusToUpdate,
    assigneeId,
    notes,
    actionMessage,
    credentials,
    hasCredentials,
    issues,
    availableStatuses,
    currentUserQuery,
    statusListQuery,
    issuesQuery,
    issueDetailQuery,
    projectMembersQuery,
    updateStatusMutation,
    assignIssueMutation,
    errorMessage,
    setNotes,
    setActionMessage,
    setSelectedIssueId,
    setAssigneeId,
    onRefresh,
    onStatusFilterChange,
    onStatusToUpdateChange,
    onAssigneeChange,
    statusFilter,
  };
}
