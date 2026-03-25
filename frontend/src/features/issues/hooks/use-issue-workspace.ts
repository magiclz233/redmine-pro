import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  getCurrentUser,
  getIssueDetail,
  getIssueEditMeta,
  getIssueStatuses,
  getMyIssues,
  updateIssue,
} from "@/services/redmine";
import { useAppStore } from "@/stores/use-app-store";
import type { main } from "../../../../wailsjs/go/models";

type EditFieldKey =
  | "subject"
  | "description"
  | "trackerId"
  | "statusId"
  | "priorityId"
  | "assigneeId"
  | "categoryId"
  | "fixedVersionId"
  | "parentIssueId"
  | "startDate"
  | "dueDate"
  | "estimatedHours"
  | "doneRatio"
  | "notes";

interface IssueEditFormState {
  subject: string;
  description: string;
  trackerId: string;
  statusId: string;
  priorityId: string;
  assigneeId: string;
  categoryId: string;
  fixedVersionId: string;
  parentIssueId: string;
  startDate: string;
  dueDate: string;
  estimatedHours: string;
  doneRatio: string;
  notes: string;
  customFieldValues: Record<string, string[]>;
}

function buildIssueEditForm(meta: main.RedmineIssueEditMeta): IssueEditFormState {
  return {
    subject: meta.subject ?? "",
    description: meta.description ?? "",
    trackerId: meta.trackerId > 0 ? String(meta.trackerId) : "",
    statusId: meta.statusId > 0 ? String(meta.statusId) : "",
    priorityId: meta.priorityId > 0 ? String(meta.priorityId) : "",
    assigneeId: meta.assigneeId > 0 ? String(meta.assigneeId) : "",
    categoryId: meta.categoryId > 0 ? String(meta.categoryId) : "",
    fixedVersionId: meta.fixedVersionId > 0 ? String(meta.fixedVersionId) : "",
    parentIssueId: meta.parentIssueId > 0 ? String(meta.parentIssueId) : "",
    startDate: meta.startDate ?? "",
    dueDate: meta.dueDate ?? "",
    estimatedHours: meta.estimatedHours ?? "",
    doneRatio: String(meta.doneRatio ?? 0),
    notes: "",
    customFieldValues: Object.fromEntries(
      (meta.customFields ?? []).map((field) => [
        String(field.id),
        Array.isArray(field.values) && field.values.length
          ? [...field.values]
          : field.value
            ? [field.value]
            : [],
      ])
    ),
  };
}

// useIssueWorkspace 统一承载任务中心工作区的数据访问与页面状态。
// 这样做可以把页面组件从查询、筛选、编辑表单和统一提交逻辑中剥离出来。
export function useIssueWorkspace() {
  const redmineBaseUrl = useAppStore((state) => state.redmineBaseUrl);
  const apiKey = useAppStore((state) => state.apiKey);
  const statusFilter = useAppStore((state) => state.statusFilter);
  const setStatusFilter = useAppStore((state) => state.setStatusFilter);

  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [editForm, setEditForm] = useState<IssueEditFormState>({
    subject: "",
    description: "",
    trackerId: "",
    statusId: "",
    priorityId: "",
    assigneeId: "",
    categoryId: "",
    fixedVersionId: "",
    parentIssueId: "",
    startDate: "",
    dueDate: "",
    estimatedHours: "",
    doneRatio: "0",
    notes: "",
    customFieldValues: {},
  });

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

  const issueEditMetaQuery = useQuery({
    queryKey: ["issue-edit-meta", redmineBaseUrl, apiKey, selectedIssueId],
    queryFn: () => getIssueEditMeta(credentials, selectedIssueId as number),
    enabled: hasCredentials && selectedIssueId !== null,
  });

  useEffect(() => {
    const meta = issueEditMetaQuery.data;
    if (!meta) {
      return;
    }
    setEditForm(buildIssueEditForm(meta));
  }, [issueEditMetaQuery.data, selectedIssueId]);

  const saveIssueMutation = useMutation({
    mutationFn: async () => {
      if (!selectedIssueId) {
        throw new Error("请先选择问题");
      }

      const editMeta = issueEditMetaQuery.data;
      if (!editMeta) {
        throw new Error("编辑元数据尚未加载完成");
      }

      return updateIssue(credentials, {
        issueId: selectedIssueId,
        subject: editForm.subject,
        description: editForm.description,
        trackerId: editForm.trackerId,
        statusId: editForm.statusId,
        priorityId: editForm.priorityId,
        assigneeId: editForm.assigneeId,
        categoryId: editForm.categoryId,
        fixedVersionId: editForm.fixedVersionId,
        parentIssueId: editForm.parentIssueId,
        startDate: editForm.startDate,
        dueDate: editForm.dueDate,
        estimatedHours: editForm.estimatedHours,
        doneRatio: editForm.doneRatio,
        notes: editForm.notes,
        customFields: (editMeta.customFields ?? []).map((field) => ({
          id: field.id,
          values: editForm.customFieldValues[String(field.id)] ?? [],
        })),
      });
    },
    onSuccess: async (message) => {
      setActionMessage(message);
      await Promise.all([
        issuesQuery.refetch(),
        issueDetailQuery.refetch(),
        issueEditMetaQuery.refetch(),
      ]);
    },
  });

  const onRefresh = async () => {
    setActionMessage("");
    await Promise.all([
      currentUserQuery.refetch(),
      statusListQuery.refetch(),
      issuesQuery.refetch(),
      issueDetailQuery.refetch(),
      issueEditMetaQuery.refetch(),
    ]);
  };

  const onStatusFilterChange = (value: string | null) => {
    setStatusFilter(value ?? "*");
    setSelectedIssueId(null);
    setActionMessage("");
  };

  const onEditFieldChange = (field: EditFieldKey, value: string) => {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const onCustomFieldValueChange = (fieldId: number, value: string) => {
    setEditForm((current) => ({
      ...current,
      customFieldValues: {
        ...current.customFieldValues,
        [String(fieldId)]: value.trim() ? [value] : [],
      },
    }));
  };

  const onCustomFieldValuesChange = (fieldId: number, values: string[]) => {
    setEditForm((current) => ({
      ...current,
      customFieldValues: {
        ...current.customFieldValues,
        [String(fieldId)]: values,
      },
    }));
  };

  const onSaveIssue = async () => {
    setActionMessage("");
    await saveIssueMutation.mutateAsync();
  };

  const getCustomFieldValues = (fieldId: number) =>
    editForm.customFieldValues[String(fieldId)] ?? [];

  const errorMessage =
    currentUserQuery.error instanceof Error
      ? currentUserQuery.error.message
      : statusListQuery.error instanceof Error
        ? statusListQuery.error.message
        : issuesQuery.error instanceof Error
          ? issuesQuery.error.message
          : issueDetailQuery.error instanceof Error
            ? issueDetailQuery.error.message
            : issueEditMetaQuery.error instanceof Error
              ? issueEditMetaQuery.error.message
              : saveIssueMutation.error instanceof Error
                ? saveIssueMutation.error.message
                : "";

  return {
    redmineBaseUrl,
    apiKey,
    selectedIssueId,
    actionMessage,
    credentials,
    hasCredentials,
    issues,
    editForm,
    currentUserQuery,
    statusListQuery,
    issuesQuery,
    issueDetailQuery,
    issueEditMetaQuery,
    saveIssueMutation,
    errorMessage,
    setActionMessage,
    setSelectedIssueId,
    onRefresh,
    onStatusFilterChange,
    onEditFieldChange,
    onCustomFieldValueChange,
    onCustomFieldValuesChange,
    onSaveIssue,
    getCustomFieldValues,
    statusFilter,
  };
}