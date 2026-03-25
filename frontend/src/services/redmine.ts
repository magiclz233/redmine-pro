import {
  AssignIssue,
  GetCurrentUser,
  GetIssueDetail,
  GetIssueEditMeta,
  GetIssueStatuses,
  GetMyIssues,
  GetProjectMembers,
  UpdateIssue,
  UpdateIssueStatus,
} from "../../wailsjs/go/main/App";
import { main } from "../../wailsjs/go/models";

export interface RedmineCredentials {
  baseUrl: string;
  apiKey: string;
}

export interface GetMyIssuesOptions {
  statusId?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateIssuePayload {
  issueId: number;
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
  customFields: Array<{
    id: number;
    values: string[];
  }>;
}

function normalizeCredentials(credentials: RedmineCredentials): RedmineCredentials {
  const baseUrl = credentials.baseUrl.trim();
  const apiKey = credentials.apiKey.trim();

  if (!baseUrl) {
    throw new Error("Redmine 地址不能为空");
  }
  if (!apiKey) {
    throw new Error("API Key 不能为空");
  }

  return { baseUrl, apiKey };
}

export async function getCurrentUser(
  credentials: RedmineCredentials
): Promise<main.RedmineUserOption> {
  const { baseUrl, apiKey } = normalizeCredentials(credentials);
  return GetCurrentUser(baseUrl, apiKey);
}

export async function getIssueStatuses(
  credentials: RedmineCredentials
): Promise<main.RedmineStatusOption[]> {
  const { baseUrl, apiKey } = normalizeCredentials(credentials);
  return GetIssueStatuses(baseUrl, apiKey);
}

export async function getMyIssues(
  credentials: RedmineCredentials,
  options: GetMyIssuesOptions = {}
): Promise<main.RedmineIssueList> {
  const { baseUrl, apiKey } = normalizeCredentials(credentials);
  const statusId = (options.statusId ?? "*").trim() || "*";
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;
  return GetMyIssues(baseUrl, apiKey, statusId, limit, offset);
}

export async function getIssueDetail(
  credentials: RedmineCredentials,
  issueId: number
): Promise<main.RedmineIssueDetail> {
  const { baseUrl, apiKey } = normalizeCredentials(credentials);
  return GetIssueDetail(baseUrl, apiKey, issueId);
}

export async function getIssueEditMeta(
  credentials: RedmineCredentials,
  issueId: number
): Promise<main.RedmineIssueEditMeta> {
  const { baseUrl, apiKey } = normalizeCredentials(credentials);
  return GetIssueEditMeta(baseUrl, apiKey, issueId);
}

export async function getProjectMembers(
  credentials: RedmineCredentials,
  projectId: number
): Promise<main.RedmineUserOption[]> {
  const { baseUrl, apiKey } = normalizeCredentials(credentials);
  return GetProjectMembers(baseUrl, apiKey, projectId);
}

export async function updateIssue(
  credentials: RedmineCredentials,
  payload: UpdateIssuePayload
): Promise<string> {
  const { baseUrl, apiKey } = normalizeCredentials(credentials);
  const request = new main.RedmineIssueUpdatePayload({
    issueId: payload.issueId,
    subject: payload.subject,
    description: payload.description,
    trackerId: payload.trackerId,
    statusId: payload.statusId,
    priorityId: payload.priorityId,
    assigneeId: payload.assigneeId,
    categoryId: payload.categoryId,
    fixedVersionId: payload.fixedVersionId,
    parentIssueId: payload.parentIssueId,
    startDate: payload.startDate,
    dueDate: payload.dueDate,
    estimatedHours: payload.estimatedHours,
    doneRatio: payload.doneRatio,
    notes: payload.notes,
    customFields: payload.customFields.map((field) =>
      new main.RedmineIssueCustomFieldUpdate({
        id: field.id,
        values: field.values,
      })
    ),
  });
  return UpdateIssue(baseUrl, apiKey, request);
}

export async function updateIssueStatus(
  credentials: RedmineCredentials,
  issueId: number,
  statusId: number,
  notes: string
): Promise<string> {
  const { baseUrl, apiKey } = normalizeCredentials(credentials);
  return UpdateIssueStatus(baseUrl, apiKey, issueId, statusId, notes);
}

export async function assignIssue(
  credentials: RedmineCredentials,
  issueId: number,
  assigneeId: number,
  notes: string
): Promise<string> {
  const { baseUrl, apiKey } = normalizeCredentials(credentials);
  return AssignIssue(baseUrl, apiKey, issueId, assigneeId, notes);
}