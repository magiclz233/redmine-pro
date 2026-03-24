import type { CSSProperties, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface MaterialSymbolProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  filled?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  grade?: -25 | 0 | 200;
  opticalSize?: 20 | 24 | 40 | 48;
}

export function MaterialSymbol({
  name,
  className,
  filled = false,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  style,
  ...props
}: MaterialSymbolProps) {
  const symbolStyle = {
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
    ...style,
  } satisfies CSSProperties;

  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined leading-none", className)}
      style={symbolStyle}
      {...props}
    >
      {name}
    </span>
  );
}
