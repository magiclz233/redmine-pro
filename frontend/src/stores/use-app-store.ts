import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppStoreState {
  redmineBaseUrl: string;
  apiKey: string;
  statusFilter: string;
  setCredentials: (payload: { redmineBaseUrl: string; apiKey: string }) => void;
  setStatusFilter: (value: string) => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      redmineBaseUrl: "https://redmine.rd.virsical.cn/",
      apiKey: "",
      statusFilter: "*",
      setCredentials: ({ redmineBaseUrl, apiKey }) =>
        set({
          redmineBaseUrl: redmineBaseUrl.trim(),
          apiKey: apiKey.trim(),
        }),
      setStatusFilter: (value) => set({ statusFilter: value }),
    }),
    {
      name: "redmine-pro.settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        redmineBaseUrl: state.redmineBaseUrl,
        apiKey: state.apiKey,
        statusFilter: state.statusFilter,
      }),
    }
  )
);
