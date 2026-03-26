import { useState, type ReactNode, type SyntheticEvent, useMemo, useEffect } from "react";
import { MaterialSymbol } from "@/components/material-symbol";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/stores/use-app-store";
import type { main } from "../../../../wailsjs/go/models";

type PreviewVideoState = "idle" | "ready" | "unsupported" | "error";

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
  previewIndex: number | null;
  mediaAttachments: main.RedmineAttachment[];
  onPreviewIndexChange: (index: number | null) => void;
  onNextMedia: () => void;
  onPrevMedia: () => void;
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
  mediaAttachments,
  apiKey,
  onPreviewIndexChange,
}: {
  attachments?: main.RedmineAttachment[];
  mediaAttachments: main.RedmineAttachment[];
  apiKey: string;
  onPreviewIndexChange: (index: number) => void;
}) {
  if (!attachments || attachments.length === 0) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getUrl = (url: string) => `${url}${url.includes("?") ? "&" : "?"}key=${apiKey}`;

  const images = attachments.filter((f) => f.contentType?.startsWith("image/"));
  const videos = attachments.filter((f) => f.contentType?.startsWith("video/"));
  const others = attachments.filter((f) => !f.contentType?.startsWith("image/") && !f.contentType?.startsWith("video/"));

  return (
    <section className="space-y-12">
      <div className="flex items-center gap-3 border-b border-outline-variant/10 pb-3">
        <MaterialSymbol name="attachment" className="text-secondary" opticalSize={20} />
        <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface">附件资源 ({attachments.length})</h3>
      </div>

      {/* 图片墙 */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">
            <MaterialSymbol name="image" opticalSize={20} />
            图片附件 ({images.length})
          </h4>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((file) => {
              const mediaIndex = mediaAttachments.findIndex((ma) => ma.id === file.id);
              return (
                <div
                  key={file.id}
                  onClick={() => mediaIndex !== -1 && onPreviewIndexChange(mediaIndex)}
                  className="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-outline-variant/5 bg-surface-container-high/20 transition-all hover:border-primary/20"
                >
                  <div className="aspect-auto min-h-[120px] overflow-hidden">
                    <img
                      src={getUrl(file.contentUrl)}
                      alt={file.filename}
                      className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="flex items-end justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-white">{file.filename}</p>
                        <p className="mt-1 text-[10px] text-white/60">{formatSize(file.filesize)}</p>
                      </div>
                      <a
                        href={getUrl(file.contentUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black"
                      >
                        <MaterialSymbol name="download" opticalSize={20} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 视频列表 */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">
            <MaterialSymbol name="movie" opticalSize={20} />
            视频附件 ({videos.length})
          </h4>
          <div className="space-y-6">
            {videos.map((file) => {
              const mediaIndex = mediaAttachments.findIndex((ma) => ma.id === file.id);
              return (
                <div key={file.id} className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-black/40 shadow-lg">
                  <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2">
                    <span className="truncate text-xs font-medium text-white/80">{file.filename}</span>
                    <span className="text-[10px] text-white/40">{formatSize(file.filesize)}</span>
                  </div>
                  <div className="relative aspect-video cursor-pointer" onClick={() => mediaIndex !== -1 && onPreviewIndexChange(mediaIndex)}>
                    <video
                      src={getUrl(file.contentUrl) + "#t=0.1"}
                      className="w-full h-full object-contain opacity-80"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors">
                      <div className="rounded-full bg-white/20 p-4 backdrop-blur-md">
                        <MaterialSymbol name="play_arrow" className="text-3xl text-white" filled />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 其他文件：紧凑型列表 */}
      {others.length > 0 && (
        <div className="space-y-4">
          <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">
            <MaterialSymbol name="description" opticalSize={20} />
            文档资料 ({others.length})
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-xl border border-outline-variant/5 bg-surface-container-high/40 p-3 transition-colors hover:bg-surface-container-high/80"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-on-surface-variant">
                  <MaterialSymbol name="description" opticalSize={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-bold text-on-surface" title={file.filename}>
                    {file.filename}
                  </div>
                  <div className="mt-0.5 text-[10px] text-on-surface-variant/60">
                    {formatSize(file.filesize)}
                  </div>
                </div>
                <a
                  href={getUrl(file.contentUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <MaterialSymbol name="download" opticalSize={20} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
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
    previewIndex,
    mediaAttachments,
    onPreviewIndexChange,
    onNextMedia,
    onPrevMedia,
    onEditFieldChange,
    onCustomFieldValueChange,
    onCustomFieldValuesChange,
    onSaveIssue,
  } = props;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [previewVideoState, setPreviewVideoState] = useState<PreviewVideoState>("idle");
  
  // 键盘快捷键支持画廊切换
  useEffect(() => {
    if (previewIndex === null) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只有在全屏预览打开时响应
      if (e.key === "ArrowRight") onNextMedia();
      if (e.key === "ArrowLeft") onPrevMedia();
      if (e.key === "Escape") onPreviewIndexChange(null);
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewIndex, onNextMedia, onPrevMedia, onPreviewIndexChange]);

  const apiKey = useAppStore((state) => state.apiKey);
  const selectedMedia = previewIndex !== null ? mediaAttachments[previewIndex] : null;
  const selectedMediaUrl = selectedMedia
    ? `${selectedMedia.contentUrl}${selectedMedia.contentUrl.includes("?") ? "&" : "?"}key=${apiKey}`
    : "";

  useEffect(() => {
    if (!selectedMedia?.contentType?.startsWith("video/")) {
      setPreviewVideoState("idle");
      return;
    }
    setPreviewVideoState("idle");
  }, [selectedMedia?.id, selectedMedia?.contentType]);

  const handlePreviewVideoLoadedMetadata = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    /**
     * Wails 内嵌 WebView 对视频编解码的支持受系统环境影响。
     * 某些 MP4 会出现“能播放音频但拿不到视频轨尺寸”的情况，此时直接降级为下载。
     */
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setPreviewVideoState("ready");
      return;
    }
    setPreviewVideoState("unsupported");
  };

  const handlePreviewVideoError = () => {
    setPreviewVideoState("error");
  };

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
          <AttachmentSection
            attachments={issueDetail.attachments}
            mediaAttachments={mediaAttachments}
            apiKey={apiKey}
            onPreviewIndexChange={onPreviewIndexChange}
          />

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

      {/* 全屏画廊预览 */}
      <Dialog open={previewIndex !== null} onOpenChange={(open) => !open && onPreviewIndexChange(null)}>
        <DialogContent
          showCloseButton={false}
          className="inset-0 h-screen w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-none bg-transparent p-0 shadow-none ring-0 outline-none"
        >
          <DialogTitle className="sr-only">媒体预览</DialogTitle>
          <div
            className="relative flex h-screen w-screen items-center justify-center bg-black/40 backdrop-blur-md"
            onClick={() => onPreviewIndexChange(null)}
          >
            {/* 左右切换按钮 */}
            {mediaAttachments.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onPrevMedia(); }}
                  className="absolute left-8 z-10 rounded-full bg-black/20 p-4 text-white backdrop-blur hover:bg-black/40 transition-all hover:scale-110"
                >
                  <MaterialSymbol name="arrow_back_ios" className="text-3xl" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onNextMedia(); }}
                  className="absolute right-10 z-10 rounded-full bg-black/20 p-4 text-white backdrop-blur hover:bg-black/40 transition-all hover:scale-110"
                >
                  <MaterialSymbol name="arrow_forward_ios" className="text-3xl" />
                </button>
              </>
            )}

            {/* 内容预览 */}
            <div
              className="relative flex max-h-[90vh] max-w-[95vw] items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia && (
                selectedMedia.contentType?.startsWith("video/") ? (
                  previewVideoState === "unsupported" || previewVideoState === "error" ? (
                    <div className="flex w-[min(92vw,560px)] flex-col items-center gap-5 rounded-2xl border border-white/10 bg-black/50 px-8 py-10 text-center text-white shadow-2xl backdrop-blur-md">
                      <div className="flex size-16 items-center justify-center rounded-full bg-white/10">
                        <MaterialSymbol name="download" opticalSize={24} className="text-3xl" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-white">当前环境暂时无法预览这个视频</h3>
                        <p className="text-sm leading-6 text-white/70">
                          该附件可能使用了当前 WebView 不兼容的视频编码。已自动切换为下载查看。
                        </p>
                      </div>
                      <a
                        href={selectedMediaUrl}
                        download={selectedMedia.filename}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm shadow-black/20 transition-opacity hover:opacity-90"
                      >
                        <MaterialSymbol name="download" opticalSize={20} />
                        下载视频附件
                      </a>
                    </div>
                  ) : (
                    <div className="relative flex items-center justify-center">
                      {previewVideoState === "idle" ? (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/35 backdrop-blur-sm">
                          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-sm text-white/80">
                            <MaterialSymbol name="progress_activity" opticalSize={20} className="animate-spin" />
                            正在检测视频兼容性...
                          </div>
                        </div>
                      ) : null}
                      <video
                        src={selectedMediaUrl}
                        controls
                        autoPlay
                        preload="metadata"
                        onLoadedMetadata={handlePreviewVideoLoadedMetadata}
                        onError={handlePreviewVideoError}
                        className="max-h-full max-w-full rounded-lg shadow-2xl"
                      />
                    </div>
                  )
                ) : (
                  <img
                    src={selectedMediaUrl}
                    alt={selectedMedia.filename}
                    className="max-h-full max-w-full rounded-lg object-contain animate-in fade-in zoom-in-95 duration-200 shadow-2xl"
                  />
                )
              )}
              
              {/* 底部信息栏 */}
              {selectedMedia && (
                <div className="absolute bottom-[-60px] flex items-center gap-4 rounded-full bg-black/40 px-6 py-2 text-white backdrop-blur shadow-xl border border-white/10">
                  <span className="text-sm font-medium">{selectedMedia.filename}</span>
                  <div className="h-4 w-px bg-white/20"></div>
                  <span className="text-xs opacity-70">
                    {previewIndex + 1} / {mediaAttachments.length}
                  </span>
                </div>
              )}
            </div>

            {/* 右上角关闭入口 */}
            <div className="absolute right-8 top-8">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onPreviewIndexChange(null)}
                className="h-10 w-10 rounded-full border border-white/10 bg-black/20 text-white backdrop-blur transition-colors hover:bg-black/40 hover:text-white"
                aria-label="关闭预览"
              >
                <MaterialSymbol name="close" opticalSize={20} />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
