import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  CheckCircle2Icon,
  Loader2Icon,
  RefreshCwIcon,
  SaveIcon,
  UserCheck2Icon,
  UserCircle2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

function App() {
  const redmineBaseUrl = useAppStore((state) => state.redmineBaseUrl);
  const apiKey = useAppStore((state) => state.apiKey);
  const statusFilter = useAppStore((state) => state.statusFilter);
  const setCredentials = useAppStore((state) => state.setCredentials);
  const setStatusFilter = useAppStore((state) => state.setStatusFilter);

  const [draftUrl, setDraftUrl] = useState(redmineBaseUrl);
  const [draftApiKey, setDraftApiKey] = useState(apiKey);
  const [saveMessage, setSaveMessage] = useState("");
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

  const onSaveCredentials = () => {
    setCredentials({ redmineBaseUrl: draftUrl, apiKey: draftApiKey });
    setSaveMessage("配置已保存，正在按新配置加载数据。");
  };

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

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl space-y-4 px-4 py-5 md:space-y-6 md:px-8 md:py-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/85 p-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold md:text-2xl">Redmine Pro</h1>
          <p className="text-sm text-muted-foreground">
            已接入真实 Redmine API：我的问题列表、详情、状态更新、指派。
          </p>
          {currentUserQuery.data ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCircle2Icon className="size-4" />
              当前用户：{currentUserQuery.data.name} ({currentUserQuery.data.login || "-"})
            </div>
          ) : null}
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={!hasCredentials || issuesQuery.isFetching}>
          {issuesQuery.isFetching ? <Loader2Icon className="size-4 animate-spin" /> : <RefreshCwIcon className="size-4" />}
          刷新数据
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>连接配置</CardTitle>
          <CardDescription>填写 Redmine 地址和 API Key 后即可直接访问你的 Redmine 数据。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input
            value={draftUrl}
            onChange={(event) => setDraftUrl(event.target.value)}
            placeholder="https://redmine.rd.virsical.cn/"
          />
          <Input
            value={draftApiKey}
            onChange={(event) => setDraftApiKey(event.target.value)}
            placeholder="输入 API Key"
            type="password"
          />
          <Button onClick={onSaveCredentials}>
            <SaveIcon className="size-4" />
            保存配置
          </Button>
          {saveMessage ? <p className="text-xs text-muted-foreground md:col-span-3">{saveMessage}</p> : null}
        </CardContent>
      </Card>

      {errorMessage ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      {actionMessage ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
          <CheckCircle2Icon className="size-4" />
          {actionMessage}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>我的问题列表</CardTitle>
            <CardDescription>总数：{issuesQuery.data?.totalCount ?? 0}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="按状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">全部状态</SelectItem>
                  {(statusListQuery.data ?? []).map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name} (#{item.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">ID</th>
                    <th className="px-3 py-2 text-left font-medium">主题</th>
                    <th className="px-3 py-2 text-left font-medium">项目</th>
                    <th className="px-3 py-2 text-left font-medium">状态</th>
                    <th className="px-3 py-2 text-left font-medium">指派给</th>
                    <th className="px-3 py-2 text-left font-medium">更新时间</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((item) => (
                    <tr
                      key={item.id}
                      className={
                        "cursor-pointer border-t transition-colors hover:bg-muted/40 " +
                        (selectedIssueId === item.id ? "bg-primary/10" : "bg-card/60")
                      }
                      onClick={() => {
                        setSelectedIssueId(item.id);
                        setActionMessage("");
                      }}
                    >
                      <td className="px-3 py-2">#{item.id}</td>
                      <td className="max-w-[280px] px-3 py-2">
                        <p className="line-clamp-2">{item.subject}</p>
                      </td>
                      <td className="px-3 py-2">{item.projectName || "-"}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline">{item.statusName || "-"}</Badge>
                      </td>
                      <td className="px-3 py-2">{item.assigneeName || "未指派"}</td>
                      <td className="px-3 py-2">{item.updatedOn || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!issues.length && !issuesQuery.isFetching ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">暂无数据</div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>问题详情与处理</CardTitle>
            <CardDescription>
              {selectedIssueId ? `当前问题：#${selectedIssueId}` : "请先在左侧选择问题"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {issueDetailQuery.isFetching ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" />
                加载问题详情中...
              </div>
            ) : null}

            {issueDetailQuery.data ? (
              <>
                <div className="space-y-1 rounded-lg border bg-muted/20 p-3 text-sm">
                  <p className="font-medium">{issueDetailQuery.data.issue.subject}</p>
                  <p className="text-muted-foreground">项目：{issueDetailQuery.data.issue.projectName || "-"}</p>
                  <p className="text-muted-foreground">状态：{issueDetailQuery.data.issue.statusName || "-"}</p>
                  <p className="text-muted-foreground">当前指派：{issueDetailQuery.data.issue.assigneeName || "未指派"}</p>
                  <p className="text-muted-foreground">描述：{issueDetailQuery.data.description || "(无描述)"}</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">状态更新</p>
                  <Select value={statusToUpdate} onValueChange={onStatusToUpdateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择新状态" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStatuses.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name} (#{item.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    className="w-full"
                    onClick={() => updateStatusMutation.mutate()}
                    disabled={updateStatusMutation.isPending || !selectedIssueId}
                  >
                    {updateStatusMutation.isPending ? <Loader2Icon className="size-4 animate-spin" /> : null}
                    更新状态
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">指派问题</p>
                  <Select value={assigneeId} onValueChange={onAssigneeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="从项目成员中选择" />
                    </SelectTrigger>
                    <SelectContent>
                      {(projectMembersQuery.data ?? []).map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name} (#{user.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={assigneeId}
                    onChange={(event) => setAssigneeId(event.target.value)}
                    type="number"
                    placeholder="或直接输入指派人 ID"
                  />
                  <Button
                    className="w-full"
                    onClick={() => assignIssueMutation.mutate()}
                    disabled={assignIssueMutation.isPending || !selectedIssueId}
                  >
                    {assignIssueMutation.isPending ? <Loader2Icon className="size-4 animate-spin" /> : <UserCheck2Icon className="size-4" />}
                    执行指派
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">备注（状态更新 / 指派都会带上）</p>
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                    placeholder="可选备注"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

export default App;
