import { useLayoutEffect } from "react";

import {
  applyResolvedTheme,
  resolveTheme,
  useThemeStore,
} from "@/stores/use-theme-store";

const SYSTEM_THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export function ThemeController() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const setResolvedTheme = useThemeStore((state) => state.setResolvedTheme);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(SYSTEM_THEME_MEDIA_QUERY);

    // 主题模式允许显式指定，也允许跟随系统；这里统一负责把最终结果同步到 document。
    const syncTheme = () => {
      const resolvedTheme = resolveTheme(themeMode, mediaQuery.matches);
      applyResolvedTheme(resolvedTheme);
      setResolvedTheme(resolvedTheme);
    };

    syncTheme();
    mediaQuery.addEventListener("change", syncTheme);

    return () => {
      mediaQuery.removeEventListener("change", syncTheme);
    };
  }, [themeMode, setResolvedTheme]);

  return null;
}
