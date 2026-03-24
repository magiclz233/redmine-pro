import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

export const THEME_STORAGE_KEY = "redmine-pro.theme";
const SYSTEM_THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "dark" || value === "light" || value === "system";
}

export function resolveTheme(
  themeMode: ThemeMode,
  systemPrefersDark: boolean
): ResolvedTheme {
  if (themeMode === "system") {
    return systemPrefersDark ? "dark" : "light";
  }

  return themeMode;
}

export function applyResolvedTheme(theme: ResolvedTheme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function readStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    const rawValue = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (!rawValue) {
      return "dark";
    }

    const parsed = JSON.parse(rawValue) as { state?: { themeMode?: unknown } };

    if (isThemeMode(parsed?.state?.themeMode)) {
      return parsed.state.themeMode;
    }
  } catch {
    return "dark";
  }

  return "dark";
}

export function getSystemResolvedTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia(SYSTEM_THEME_MEDIA_QUERY).matches ? "dark" : "light";
}

export function bootstrapTheme() {
  const themeMode = readStoredThemeMode();
  const resolvedTheme = resolveTheme(themeMode, getSystemResolvedTheme() === "dark");
  applyResolvedTheme(resolvedTheme);
}

interface ThemeStoreState {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (themeMode: ThemeMode) => void;
  setResolvedTheme: (resolvedTheme: ResolvedTheme) => void;
}

export const useThemeStore = create<ThemeStoreState>()(
  persist(
    (set) => ({
      themeMode: "dark",
      resolvedTheme: "dark",
      setThemeMode: (themeMode) => set({ themeMode }),
      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        themeMode: state.themeMode,
      }),
    }
  )
);
