import { useState, type ReactNode, useMemo } from "react";
import { MaterialSymbol } from "@/components/material-symbol";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/stores/use-app-store";
import type { main } from "../../../../wailsjs/go/models";

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
}

interface IssueDetailPanelProps {
  selectedIssueId: number | null;
  issueDetail?: main.RedmineIssueDetail;
  issueEditMeta?: main.RedmineIssueEditMeta;
  editForm: IssueEditFormState;
  getCustomFieldValues: (fieldId: number) => string[];
  isDetailFetching: boolean;
  isEditMetaFetching: boolean;
  isSavePending: boolean;
  onEditFieldChange: (field: keyof IssueEditFormState, value: string) => void;
  onCustomFieldValueChange: (fieldId: number, value: string) => void;
  onCustomFieldValuesChange: (fieldId: number, values: string[]) => void;
  onSaveIssue: () => Promise<void>;
}

const EMPTY_SELECT_VALUE = "__empty__";

function hasFieldValue(value?: string) {
  return Boolean(value?.trim());
}

function formatFieldValue(value?: string) {
  return hasFieldValue(value) ? value!.trim() : "-";
}

function formatDateLabel(value?: string) {
  if (!value) {
    return "-";
  }
  return value.length >= 16 ? value.slice(0, 16).replace("T", " ") : value;
}

/**
 * DescriptionRenderer 尝试将描述文本中的图片链接和附件渲染为可视化元素。
 * 为了安全加载 Redmine 图片，会自动给附件链接附加 API Key。
 */
function DescriptionRenderer({ text, apiKey }: { text: string; apiKey: string }) {
  if (!text) return <p className="text-on-surface-variant/40">没有提供详细描述。</p>;

  // 为 Redmine 附件下载链接尝试添加 API Key 以供直接显示图片
  const processUrl = (url: string) => {
    if (url.includes("/attachments/download/") && !url.includes("key=")) {
      return `${url}${url.includes("?") ? "&" : "?"}key=${apiKey}`;
    }
    return url;
  };

  // 1. 处理常见图片链接 (http...jpg/png)
  // 2. 处理 Redmine 图片语法 !http...! 或 !attachment.png!
  const lines = text.split("\n");

  return (
    <div className="space-y-4">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // 识别 !url! 或者 !attachment! 语法
        const imageMatches = trimmed.match(/^!(https?:\/\/[^!^ ]+)!$/);
        if (imageMatches) {
          const imgUrl = processUrl(imageMatches[1]);
          return (
            <div key={idx} className="my-4 overflow-hidden rounded-xl border border-outline-variant/10 shadow-lg">
              <img src={imgUrl} alt="Issue Image" className="max-h-[600px] w-auto max-w-full" />
            </div>
          );
        }

        // 识别纯图片链接行
        if (trimmed.match(/^https?:\/\/[^ ]+\.(png|jpg|jpeg|gif|webp)$/i)) {
          const imgUrl = processUrl(trimmed);
          return (
            <div key={idx} className="my-4 overflow-hidden rounded-xl border border-outline-variant/10 shadow-lg">
              <img src={imgUrl} alt="Inline Image" className="max-h-[600px] w-auto max-w-full" />
            </div>
          );
        }

        // 默认作为文本渲染，并简单检测 URL
        return (
          <p key={idx} className="min-h-[1.5em] whitespace-pre-wrap break-words">
            {line || " "}
          </p>
        );
      })}
    </div>
  );
}

function AttachmentSection({
  attachments,
  apiKey,
}: {
  attachments?: main.RedmineAttachment[];
  apiKey: string;
}) {
  if (!attachments || attachments.length === 0) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-3">
        <MaterialSymbol name="attachment" className="text-primary" opticalSize={20} />
        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface">附件列表 ({attachments.length})</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {attachments.map((file) => {
          const isImage = file.contentType?.startsWith("image/");
          const downloadUrl = `${file.contentUrl}${file.contentUrl.includes("?") ? "&" : "?"}key=${apiKey}`;

          return (
            <div
              key={file.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-high/40 p-4 transition-all hover:border-primary/30 hover:bg-surface-container-high/60"
            >
              <div className="flex flex-1 items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest text-on-surface-variant">
                  <MaterialSymbol name={isImage ? "image" : "description"} opticalSize={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-on-surface" title={file.filename}>
                    {file.filename}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-on-surface-variant/60">
                    <span>{formatSize(file.filesize)}</span>
                    <span>•</span>
                    <span>{file.authorName || "未知"}</span>
                  </div>
                </div>
              </div>

              {isImage && (
                <div className="mt-4 aspect-video overflow-hidden rounded-lg bg-black/20">
                  <img src={downloadUrl} alt={file.filename} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="text-[10px] text-on-surface-variant/40">{formatDateLabel(file.createdOn)}</div>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-on-primary"
                >
                  <MaterialSymbol name="download" opticalSize={20} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function findSelectName(options: Array<{ id: number; name: string }>, value: string, placeholder: string) {
  if (!value) {
    return placeholder;
  }
  const matched = options.find((item) => String(item.id) === value);
  return matched?.name ?? placeholder;
}

function findFieldOptionLabel(options: main.RedmineFieldOption[], value: string, placeholder: string) {
  if (!value) {
    return placeholder;
  }
  const matched = options.find((item) => item.value === value);
  return matched?.label ?? value;
}



function EditFieldBlock(props: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">
        {props.label}
        {props.required ? <span className="ml-1 text-primary">*</span> : null}
      </label>
      {props.children}
    </div>
  );
}

function EditSelect(props: {
  value: string;
  placeholder: string;
  displayName: string;
  disabled?: boolean;
  clearLabel?: string;
  children: ReactNode;
  onValueChange: (value: string | null) => void;
}) {
  const { value, placeholder, displayName, disabled, clearLabel, children, onValueChange } = props;

  return (
    <Select
      value={value || EMPTY_SELECT_VALUE}
      onValueChange={(nextValue) => onValueChange(nextValue === EMPTY_SELECT_VALUE ? "" : nextValue)}
    >
      <SelectTrigger
        disabled={disabled}
        className="h-10 w-full border-outline-variant/25 bg-surface-container text-sm text-on-surface focus:ring-1 focus:ring-primary/40"
      >
        <span className={value ? "line-clamp-1 flex-1 text-left text-on-surface" : "line-clamp-1 flex-1 text-left text-on-surface-variant/50"}>
          {displayName || placeholder}
        </span>
      </SelectTrigger>
      <SelectContent>
        {clearLabel ? <SelectItem value={EMPTY_SELECT_VALUE}>{clearLabel}</SelectItem> : null}
        {children}
      </SelectContent>
    </Select>
  );
}

function renderCustomFieldEditor(
  field: main.RedmineIssueCustomFieldMeta,
  values: string[],
  onValueChange: (value: string) => void,
  onValuesChange: (nextValues: string[]) => void
) {
  const singleValue = values[0] ?? "";
  const hasOptions = Array.isArray(field.possibleValues) && field.possibleValues.length > 0;

  if (field.multiple && hasOptions) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(field.possibleValues ?? []).map((option) => {
            const active = values.includes(option.value);
            return (
              <Button
                key={`${field.id}-${option.value}`}
                type="button"
                variant={active ? "secondary" : "outline"}
                size="sm"
                className={
                  active
                    ? "border-primary/20 bg-primary/15 text-primary hover:bg-primary/20"
                    : "border-outline-variant/20 bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }
                onClick={() => {
                  if (active) {
                    onValuesChange(values.filter((item) => item !== option.value));
                    return;
                  }
                  onValuesChange([...values, option.value]);
                }}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
        {!field.required && values.length ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-0 text-xs text-on-surface-variant"
            onClick={() => onValuesChange([])}
          >
            清空当前选择
          </Button>
        ) : null}
      </div>
    );
  }

  if (field.multiple) {
    return (
      <Textarea
        className="min-h-24 resize-none border-outline-variant/20 bg-surface-container px-4 py-3 text-sm shadow-none placeholder:text-outline-variant/50 focus-visible:ring-1 focus-visible:ring-primary/40"
        placeholder="一行一个值"
        value={values.join("\n")}
        onChange={(event) =>
          onValuesChange(
            event.target.value
              .split(/\r?\n|,/)
              .map((item) => item.trim())
              .filter(Boolean)
          )
        }
      />
    );
  }

  if (hasOptions || field.fieldFormat === "bool") {
    return (
      <EditSelect
        value={singleValue}
        placeholder="请选择"
        displayName={findFieldOptionLabel(field.possibleValues ?? [], singleValue, "请选择")}
        clearLabel={field.required ? undefined : "清空当前值"}
        onValueChange={(value) => onValueChange(value ?? "")}
      >
        {(field.possibleValues ?? []).map((option) => (
          <SelectItem key={`${field.id}-${option.value}`} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </EditSelect>
    );
  }

  if (field.fieldFormat === "text") {
    return (
      <Textarea
        className="min-h-24 resize-none border-outline-variant/20 bg-surface-container px-4 py-3 text-sm shadow-none placeholder:text-outline-variant/50 focus-visible:ring-1 focus-visible:ring-primary/40"
        placeholder="请输入内容"
        value={singleValue}
        onChange={(event) => onValueChange(event.target.value)}
      />
    );
  }

  if (field.fieldFormat === "date") {
    return (
      <Input
        type="date"
        className="h-10 border-outline-variant/25 bg-surface-container text-sm shadow-none"
        value={singleValue}
        onChange={(event) => onValueChange(event.target.value)}
      />
    );
  }

  return (
    <Input
      className="h-10 border-outline-variant/25 bg-surface-container text-sm shadow-none"
      value={singleValue}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder="请输入内容"
    />
  );
}

export function IssueDetailPanel(props: IssueDetailPanelProps) {
  const {
    selectedIssueId,
    issueDetail,
    issueEditMeta,
    editForm,
    getCustomFieldValues,
    isDetailFetching,
    isEditMetaFetching,
    isSavePending,
    onEditFieldChange,
    onCustomFieldValueChange,
    onCustomFieldValuesChange,
    onSaveIssue,
  } = props;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const apiKey = useAppStore((state) => state.apiKey);

  if (!selectedIssueId) {
    return (
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-surface-container-lowest">
        <MaterialSymbol name="assignment" opticalSize={48} className="mb-4 text-5xl text-outline-variant/40" />
        <p className="text-sm text-on-surface-variant">请在左侧选择一个任务查看详情</p>
      </section>
    );
  }

  if (isDetailFetching && !issueDetail) {
    return (
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-surface-container-lowest">
        <MaterialSymbol name="progress_activity" opticalSize={48} className="mb-4 animate-spin text-4xl text-primary" />
        <p className="text-sm text-on-surface-variant">正在加载任务详情...</p>
      </section>
    );
  }

  if (!issueDetail) {
    return (
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-surface-container-lowest">
        <p className="text-sm text-destructive">未获取到问题详情数据</p>
      </section>
    );
  }

  const { issue } = issueDetail;
  const mergedFields = [...(issueDetail.standardFields ?? []), ...(issueDetail.customFields ?? [])].filter((field) =>
    Boolean(field.name?.trim())
  );

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-surface-container-lowest">
      {/* Fixed Header */}
      <div className="flex-none border-b border-outline-variant/10 px-8 py-5 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">#{issue.id}</span>
            <span className="rounded bg-secondary-container/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-secondary">
              {issue.statusName || "未知状态"}
            </span>
          </div>
          <h2 className="max-w-4xl text-2xl font-bold leading-tight tracking-tight text-on-surface">
            {issue.subject}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-on-surface-variant">
            <span>创建人 {issue.authorName || "未知用户"}</span>
            <span className="text-outline-variant/30 px-1">/</span>
            <span>更新时间 {formatDateLabel(issue.updatedOn)}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-95"
          >
            <MaterialSymbol name="edit" className="text-sm" opticalSize={20} />
            编辑
          </button>
          <button className="rounded p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high">
            <MaterialSymbol name="more_vert" opticalSize={20} />
          </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="custom-scrollbar flex-1 overflow-y-auto w-full">
        {/* Comprehensive Meta Information */}
        <div className="border-b border-outline-variant/5 bg-surface-container-lowest/20 px-8 py-6">
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 max-w-full">
            {mergedFields.map((field, index) => {
              const valueExists = hasFieldValue(field.value);
              return (
                <div key={`${field.name}-${index}`} className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant/60">
                    {field.name || `字段 ${index + 1}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        valueExists
                          ? "break-words text-xs font-bold text-on-surface pr-4"
                          : "text-xs font-bold text-on-surface-variant/40 pr-4"
                      }
                    >
                      {formatFieldValue(field.value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex max-w-6xl flex-col gap-16 px-8 py-10">
          {/* Description Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-3">
              <MaterialSymbol name="description" className="text-primary" opticalSize={20} />
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface">问题详情描述</h3>
            </div>
            <div className="text-[15px] leading-relaxed text-on-surface-variant/90">
              <DescriptionRenderer text={issueDetail.description} apiKey={apiKey} />
            </div>
          </section>

          {/* Attachments Section */}
          <AttachmentSection attachments={issueDetail.attachments} apiKey={apiKey} />

          {/* History / Comments Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
              <div className="flex items-center gap-3">
                <MaterialSymbol name="forum" className="text-primary" opticalSize={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface">历史记录与交流</h3>
              </div>
              <button className="text-[10px] font-bold uppercase text-primary hover:underline">按时间倒序</button>
            </div>
            <div className="py-2 text-sm text-on-surface-variant/60">
              暂未对接历史记录与评论区 API...
            </div>
          </section>
        </div>
      </div>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          style={{ maxWidth: "800px" }}
          className="flex w-full flex-col border-l border-outline-variant/10 bg-surface-container-lowest p-0 shadow-2xl"
        >
          <SheetDescription className="hidden">Edit issue details</SheetDescription>
          <div className="flex shrink-0 items-center justify-between border-b border-outline-variant/10 px-6 py-4">
            <SheetTitle className="flex items-center gap-2 text-sm font-bold tracking-tight text-on-surface">
              <MaterialSymbol name="edit_note" className="text-sm text-primary" opticalSize={20} />
              编辑问题 #{issue.id}
            </SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="h-8 px-3 text-xs font-medium text-on-surface-variant transition-colors hover:text-on-surface"
                onClick={() => setIsDrawerOpen(false)}
                disabled={isSavePending}
              >
                取消
              </Button>
              <Button
                className="h-8 rounded-md bg-primary px-4 text-xs font-bold text-on-primary shadow-none transition-all hover:brightness-110 active:scale-95"
                onClick={async () => {
                  try {
                    await onSaveIssue();
                    setIsDrawerOpen(false);
                  } catch {
                    // 提交失败时保留抽屉，便于继续修改或重试。
                  }
                }}
                disabled={isSavePending || isEditMetaFetching}
              >
                {isSavePending ? (
                  <span className="flex items-center gap-2">
                    <MaterialSymbol name="progress_activity" className="animate-spin text-sm" opticalSize={20} />
                    保存更改...
                  </span>
                ) : (
                  "保存更改"
                )}
              </Button>
            </div>
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto px-8 py-8">
            {isEditMetaFetching && !issueEditMeta ? (
              <div className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
                <MaterialSymbol name="progress_activity" className="animate-spin text-sm" opticalSize={20} />
                正在加载编辑元数据...
              </div>
            ) : null}

            <div className="space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <EditFieldBlock label="跟踪类型 (Tracker)" required>
                    <EditSelect
                      value={editForm.trackerId}
                      placeholder="选择跟踪类型"
                      displayName={findSelectName(issueEditMeta?.trackers ?? [], editForm.trackerId, "选择跟踪类型")}
                      disabled={!issueEditMeta?.trackers?.length}
                      onValueChange={(value) => onEditFieldChange("trackerId", value ?? "")}
                    >
                      {(issueEditMeta?.trackers ?? []).map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </EditSelect>
                  </EditFieldBlock>

                  <EditFieldBlock label="主题 (Subject)" required>
                    <Input
                      className="h-10 border-outline-variant/25 bg-surface-container-lowest text-sm shadow-none focus:ring-1 focus:ring-primary/40"
                      value={editForm.subject}
                      onChange={(event) => onEditFieldChange("subject", event.target.value)}
                      placeholder="请输入主题"
                    />
                  </EditFieldBlock>
                </div>

                <div className="space-y-2">
                  <EditFieldBlock label="描述 (Markdown)">
                    <Textarea
                      className="min-h-48 resize-none border-outline-variant/20 bg-surface-container-lowest p-4 font-mono text-sm leading-relaxed text-on-surface-variant shadow-none focus-visible:ring-1 focus-visible:ring-primary/40"
                      value={editForm.description}
                      onChange={(event) => onEditFieldChange("description", event.target.value)}
                      placeholder="请输入问题描述"
                    />
                  </EditFieldBlock>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <EditFieldBlock label="状态" required>
                    <EditSelect
                      value={editForm.statusId}
                      placeholder="选择状态"
                      displayName={findSelectName(issueEditMeta?.statuses ?? [], editForm.statusId, "选择状态")}
                      disabled={!issueEditMeta?.statuses?.length}
                      onValueChange={(value) => onEditFieldChange("statusId", value ?? "")}
                    >
                      {(issueEditMeta?.statuses ?? []).map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </EditSelect>
                  </EditFieldBlock>

                  <EditFieldBlock label="优先级">
                    <EditSelect
                      value={editForm.priorityId}
                      placeholder="选择优先级"
                      displayName={findSelectName(issueEditMeta?.priorities ?? [], editForm.priorityId, "选择优先级")}
                      disabled={!issueEditMeta?.priorities?.length}
                      onValueChange={(value) => onEditFieldChange("priorityId", value ?? "")}
                    >
                      {(issueEditMeta?.priorities ?? []).map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </EditSelect>
                  </EditFieldBlock>

                  <EditFieldBlock label="指派给">
                    <EditSelect
                      value={editForm.assigneeId}
                      placeholder="选择负责人"
                      displayName={findSelectName(issueEditMeta?.assignees ?? [], editForm.assigneeId, "选择负责人")}
                      disabled={!issueEditMeta?.assignees?.length}
                      clearLabel="不设置"
                      onValueChange={(value) => onEditFieldChange("assigneeId", value ?? "")}
                    >
                      {(issueEditMeta?.assignees ?? []).map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </EditSelect>
                  </EditFieldBlock>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <EditFieldBlock label="分类">
                    <EditSelect
                      value={editForm.categoryId}
                      placeholder="选择分类"
                      displayName={findSelectName(issueEditMeta?.categories ?? [], editForm.categoryId, "选择分类")}
                      disabled={!issueEditMeta?.categories?.length}
                      clearLabel="不设置"
                      onValueChange={(value) => onEditFieldChange("categoryId", value ?? "")}
                    >
                      {(issueEditMeta?.categories ?? []).map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </EditSelect>
                  </EditFieldBlock>

                  <EditFieldBlock label="目标版本">
                    <EditSelect
                      value={editForm.fixedVersionId}
                      placeholder="选择目标版本"
                      displayName={findSelectName(issueEditMeta?.versions ?? [], editForm.fixedVersionId, "选择目标版本")}
                      disabled={!issueEditMeta?.versions?.length}
                      clearLabel="不设置"
                      onValueChange={(value) => onEditFieldChange("fixedVersionId", value ?? "")}
                    >
                      {(issueEditMeta?.versions ?? []).map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </EditSelect>
                  </EditFieldBlock>

                  <EditFieldBlock label="父任务">
                    <Input
                      className="h-10 border-outline-variant/25 bg-surface-container-lowest text-sm shadow-none focus:ring-1 focus:ring-primary/40"
                      value={editForm.parentIssueId}
                      onChange={(event) => onEditFieldChange("parentIssueId", event.target.value)}
                      placeholder="任务 ID (如 #123)"
                    />
                  </EditFieldBlock>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <EditFieldBlock label="开始日期">
                    <Input
                      type="date"
                      className="h-10 border-outline-variant/25 bg-surface-container-lowest text-sm shadow-none focus:ring-1 focus:ring-primary/40"
                      value={editForm.startDate}
                      onChange={(event) => onEditFieldChange("startDate", event.target.value)}
                    />
                  </EditFieldBlock>

                  <EditFieldBlock label="完成日期 (截止日期)">
                    <Input
                      type="date"
                      className="h-10 border-outline-variant/25 bg-surface-container-lowest text-sm shadow-none focus:ring-1 focus:ring-primary/40"
                      value={editForm.dueDate}
                      onChange={(event) => onEditFieldChange("dueDate", event.target.value)}
                    />
                  </EditFieldBlock>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <EditFieldBlock label="预期工时 (h)">
                    <Input
                      type="number"
                      step="0.1"
                      className="h-10 border-outline-variant/25 bg-surface-container-lowest text-sm shadow-none focus:ring-1 focus:ring-primary/40"
                      value={editForm.estimatedHours}
                      onChange={(event) => onEditFieldChange("estimatedHours", event.target.value)}
                      placeholder="小时"
                    />
                  </EditFieldBlock>

                  <EditFieldBlock label="完成进度 (%)">
                    <div className="mt-1.5 flex items-center gap-3">
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        className="h-6 flex-1 accent-primary"
                        value={editForm.doneRatio || 0}
                        onChange={(event) => onEditFieldChange("doneRatio", event.target.value)}
                      />
                      <span className="w-10 text-right font-mono text-xs font-bold text-primary">
                        {editForm.doneRatio || 0}%
                      </span>
                    </div>
                  </EditFieldBlock>
                </div>
              </div>

              {(issueEditMeta?.customFields?.length ?? 0) > 0 ? (
                <>
                  <div className="my-6 h-px w-full bg-outline-variant/10"></div>
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold tracking-widest text-on-surface-variant uppercase">
                      增强属性 / 自定义字段
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {(issueEditMeta?.customFields ?? []).map((field) => (
                        <div
                          key={field.id}
                          className={field.fieldFormat === "text" || field.multiple ? "md:col-span-2 lg:col-span-3" : "col-span-1"}
                        >
                          <EditFieldBlock label={field.name} required={field.required}>
                            {renderCustomFieldEditor(
                              field,
                              getCustomFieldValues(field.id),
                              (value) => onCustomFieldValueChange(field.id, value),
                              (values) => onCustomFieldValuesChange(field.id, values)
                            )}
                          </EditFieldBlock>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              <div className="my-6 h-px w-full bg-outline-variant/10"></div>
              <div className="space-y-3">
                <EditFieldBlock label="提交备注">
                  <Textarea
                    className="min-h-24 resize-none border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm shadow-none placeholder:text-outline-variant/50 focus-visible:ring-1 focus-visible:ring-primary/40"
                    placeholder="可填写本次修改说明，统一随本次提交带上"
                    value={editForm.notes}
                    onChange={(event) => onEditFieldChange("notes", event.target.value)}
                  />
                </EditFieldBlock>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}