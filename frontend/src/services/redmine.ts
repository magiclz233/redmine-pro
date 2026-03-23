import {
  AssignIssue,
  GetCurrentUser,
  GetIssueDetail,
  GetIssueStatuses,
  GetMyIssues,
  GetProjectMembers,
  UpdateIssueStatus,
} from "../../wailsjs/go/main/App";
import type { main } from "../../wailsjs/go/models";

export interface RedmineCredentials {
  baseUrl: string;
  apiKey: string;
}

export interface GetMyIssuesOptions {
  statusId?: string;
  limit?: number;
  offset?: number;
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

export async function getProjectMembers(
  credentials: RedmineCredentials,
  projectId: number
): Promise<main.RedmineUserOption[]> {
  const { baseUrl, apiKey } = normalizeCredentials(credentials);
  return GetProjectMembers(baseUrl, apiKey, projectId);
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
