import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const APP_SETTINGS_STORAGE_KEY = "redmine-pro.settings";
const DEFAULT_REDMINE_BASE_URL = "https://redmine.rd.virsical.cn";

export interface RedmineInstanceProfile {
  id: string;
  label: string;
  redmineBaseUrl: string;
  apiKey: string;
  lastConnectedAt: string;
  lastUserName: string;
  lastUserLogin: string;
}

interface CredentialsPayload {
  redmineBaseUrl: string;
  apiKey: string;
  userName?: string;
  userLogin?: string;
}

interface AppStoreState {
  activeInstanceId: string | null;
  instances: RedmineInstanceProfile[];
  redmineBaseUrl: string;
  apiKey: string;
  statusFilter: string;
  setCredentials: (payload: CredentialsPayload) => void;
  activateInstance: (instanceId: string) => void;
  removeInstance: (instanceId: string) => void;
  setStatusFilter: (value: string) => void;
}

function normalizeBaseUrl(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.endsWith("/") ? trimmedValue.slice(0, -1) : trimmedValue;
}

function getInstanceLabel(baseUrl: string) {
  try {
    return new URL(baseUrl).host || "Redmine 实例";
  } catch {
    return baseUrl || "Redmine 实例";
  }
}

function createInstanceId(baseUrl: string) {
  const host = getInstanceLabel(baseUrl).replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return `instance-${host || "redmine"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildInstanceProfile(
  payload: CredentialsPayload,
  currentProfile?: RedmineInstanceProfile
): RedmineInstanceProfile {
  const redmineBaseUrl = normalizeBaseUrl(payload.redmineBaseUrl);
  const apiKey = payload.apiKey.trim();

  return {
    id: currentProfile?.id ?? createInstanceId(redmineBaseUrl),
    label: currentProfile?.label || getInstanceLabel(redmineBaseUrl),
    redmineBaseUrl,
    apiKey,
    lastConnectedAt: new Date().toISOString(),
    lastUserName: payload.userName?.trim() || currentProfile?.lastUserName || "",
    lastUserLogin: payload.userLogin?.trim() || currentProfile?.lastUserLogin || "",
  };
}

function buildLegacyInstanceProfile(redmineBaseUrl: string, apiKey: string): RedmineInstanceProfile {
  return buildInstanceProfile({
    redmineBaseUrl,
    apiKey,
  });
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      activeInstanceId: null,
      instances: [],
      redmineBaseUrl: DEFAULT_REDMINE_BASE_URL,
      apiKey: "",
      statusFilter: "*",
      setCredentials: (payload) =>
        set((state) => {
          const redmineBaseUrl = normalizeBaseUrl(payload.redmineBaseUrl);
          const currentProfile = state.instances.find(
            (item) => normalizeBaseUrl(item.redmineBaseUrl) === redmineBaseUrl
          );
          const nextProfile = buildInstanceProfile(
            {
              ...payload,
              redmineBaseUrl,
            },
            currentProfile
          );

          return {
            activeInstanceId: nextProfile.id,
            instances: [
              nextProfile,
              ...state.instances.filter((item) => item.id !== nextProfile.id),
            ],
            redmineBaseUrl: nextProfile.redmineBaseUrl,
            apiKey: nextProfile.apiKey,
          };
        }),
      activateInstance: (instanceId) =>
        set((state) => {
          const nextInstance = state.instances.find((item) => item.id === instanceId);

          if (!nextInstance) {
            return {};
          }

          return {
            activeInstanceId: nextInstance.id,
            redmineBaseUrl: nextInstance.redmineBaseUrl,
            apiKey: nextInstance.apiKey,
          };
        }),
      removeInstance: (instanceId) =>
        set((state) => {
          const nextInstances = state.instances.filter((item) => item.id !== instanceId);

          if (state.activeInstanceId !== instanceId) {
            return {
              instances: nextInstances,
            };
          }

          const nextActiveInstance = nextInstances[0];

          if (!nextActiveInstance) {
            return {
              activeInstanceId: null,
              instances: [],
              redmineBaseUrl: DEFAULT_REDMINE_BASE_URL,
              apiKey: "",
            };
          }

          return {
            activeInstanceId: nextActiveInstance.id,
            instances: nextInstances,
            redmineBaseUrl: nextActiveInstance.redmineBaseUrl,
            apiKey: nextActiveInstance.apiKey,
          };
        }),
      setStatusFilter: (value) => set({ statusFilter: value }),
    }),
    {
      name: APP_SETTINGS_STORAGE_KEY,
      version: 2,
      migrate: (persistedState, version) => {
        if (
          version < 2 &&
          persistedState &&
          typeof persistedState === "object" &&
          "redmineBaseUrl" in persistedState &&
          "apiKey" in persistedState
        ) {
          const legacyState = persistedState as {
            redmineBaseUrl?: string;
            apiKey?: string;
            statusFilter?: string;
          };
          const redmineBaseUrl = normalizeBaseUrl(legacyState.redmineBaseUrl || "");
          const apiKey = legacyState.apiKey?.trim() || "";

          if (redmineBaseUrl && apiKey) {
            const legacyInstance = buildLegacyInstanceProfile(redmineBaseUrl, apiKey);
            return {
              activeInstanceId: legacyInstance.id,
              instances: [legacyInstance],
              redmineBaseUrl,
              apiKey,
              statusFilter: legacyState.statusFilter || "*",
            };
          }
        }

        return persistedState as AppStoreState;
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeInstanceId: state.activeInstanceId,
        instances: state.instances,
        redmineBaseUrl: state.redmineBaseUrl,
        apiKey: state.apiKey,
        statusFilter: state.statusFilter,
      }),
    }
  )
);
