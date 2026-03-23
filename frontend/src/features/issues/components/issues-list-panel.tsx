import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { main } from "../../../../wailsjs/go/models";

interface IssuesListPanelProps {
  totalCount: number;
  issues: main.RedmineIssueSummary[];
  statusFilter: string;
  statuses: main.RedmineStatusOption[];
  selectedIssueId: number | null;
  isFetching: boolean;
  onStatusFilterChange: (value: string | null) => void;
  onIssueSelect: (issueId: number) => void;
}

export function IssuesListPanel(props: IssuesListPanelProps) {
  const {
    totalCount,
    issues,
    statusFilter,
    statuses,
    selectedIssueId,
    isFetching,
    onStatusFilterChange,
    onIssueSelect,
  } = props;

  return (
    <Card className="xl:col-span-3">
      <CardHeader>
        <CardTitle>我的问题列表</CardTitle>
        <CardDescription>总数：{totalCount}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="按状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="*">全部状态</SelectItem>
              {statuses.map((item) => (
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
                  onClick={() => onIssueSelect(item.id)}
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
          {!issues.length && !isFetching ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">暂无数据</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
