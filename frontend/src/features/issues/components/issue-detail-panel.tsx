import {
  CheckCircle2Icon,
  Loader2Icon,
  UserCheck2Icon,
} from "lucide-react";

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
import type { main } from "../../../../wailsjs/go/models";

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
    onAssigneeInputChange,
    onNotesChange,
    onUpdateStatus,
    onAssignIssue,
  } = props;

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>问题详情与处理</CardTitle>
        <CardDescription>
          {selectedIssueId ? `当前问题：#${selectedIssueId}` : "请先在左侧选择问题"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDetailFetching ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
            加载问题详情中...
          </div>
        ) : null}

        {issueDetail ? (
          <>
            <div className="space-y-1 rounded-lg border bg-muted/20 p-3 text-sm">
              <p className="font-medium">{issueDetail.issue.subject}</p>
              <p className="text-muted-foreground">项目：{issueDetail.issue.projectName || "-"}</p>
              <p className="text-muted-foreground">状态：{issueDetail.issue.statusName || "-"}</p>
              <p className="text-muted-foreground">
                当前指派：{issueDetail.issue.assigneeName || "未指派"}
              </p>
              <p className="text-muted-foreground">描述：{issueDetail.description || "(无描述)"}</p>
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
              <Button className="w-full" onClick={onUpdateStatus} disabled={isUpdatePending || !selectedIssueId}>
                {isUpdatePending ? <Loader2Icon className="size-4 animate-spin" /> : null}
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
                  {projectMembers.map((user) => (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {user.name} (#{user.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={assigneeId}
                onChange={(event) => onAssigneeInputChange(event.target.value)}
                type="number"
                placeholder="或直接输入指派人 ID"
              />
              <Button className="w-full" onClick={onAssignIssue} disabled={isAssignPending || !selectedIssueId}>
                {isAssignPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <UserCheck2Icon className="size-4" />
                )}
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
                onChange={(event) => onNotesChange(event.target.value)}
              />
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
