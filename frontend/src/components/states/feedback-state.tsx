import type { ComponentProps } from "react";

import { MaterialSymbol } from "@/components/material-symbol";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeedbackStateProps {
  title: string;
  description: string;
  symbol: string;
  tone?: "default" | "danger";
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  symbolClassName?: string;
}

function FeedbackState({
  title,
  description,
  symbol,
  tone = "default",
  actionLabel,
  onAction,
  className,
  symbolClassName,
}: FeedbackStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border px-5 py-8 text-center",
        tone === "danger"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-outline-variant/20 bg-surface-container-low/60 text-on-surface-variant",
        className
      )}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-2xl",
          tone === "danger" ? "bg-destructive/12" : "bg-primary/10"
        )}
      >
        <MaterialSymbol
          name={symbol}
          className={cn(
            "text-[24px]",
            tone === "danger" ? "text-destructive" : "text-primary",
            symbolClassName
          )}
        />
      </div>
      <div className="space-y-1">
        <p className={cn("text-sm font-semibold", tone === "danger" ? "text-destructive" : "text-on-surface")}>
          {title}
        </p>
        <p className={cn("max-w-md text-sm", tone === "danger" ? "text-destructive/80" : "text-on-surface-variant")}>
          {description}
        </p>
      </div>
      {actionLabel && onAction ? (
        <Button size="sm" variant={tone === "danger" ? "destructive" : "outline"} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

type SharedStateProps = Pick<
  FeedbackStateProps,
  "title" | "description" | "actionLabel" | "onAction" | "className"
>;

export function LoadingState(props: SharedStateProps) {
  return (
    <FeedbackState
      symbol="progress_activity"
      symbolClassName="animate-spin"
      {...props}
    />
  );
}

export function EmptyState(props: SharedStateProps) {
  return <FeedbackState symbol="inventory_2" {...props} />;
}

export function ErrorState(props: SharedStateProps) {
  return <FeedbackState tone="danger" symbol="error" {...props} />;
}

export type FeedbackStateComponentProps = ComponentProps<typeof FeedbackState>;
