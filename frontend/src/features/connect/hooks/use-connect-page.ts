import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getCurrentUser } from "@/services/redmine";
import { useAppStore } from "@/stores/use-app-store";

interface ConnectionFormErrors {
  url: string;
  apiKey: string;
}

interface UseConnectPageOptions {
  redirectTo?: string;
  persistOnSuccess?: boolean;
}

function validateConnectionForm(draftUrl: string, draftApiKey: string): ConnectionFormErrors {
  const nextErrors: ConnectionFormErrors = {
    url: "",
    apiKey: "",
  };

  const trimmedUrl = draftUrl.trim();
  const trimmedApiKey = draftApiKey.trim();

  if (!trimmedUrl) {
    nextErrors.url = "请输入 Redmine 实例 URL。";
  } else {
    try {
      const parsedUrl = new URL(trimmedUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        nextErrors.url = "实例 URL 必须以 http:// 或 https:// 开头。";
      }
    } catch {
      nextErrors.url = "实例 URL 格式不正确。";
    }
  }

  if (!trimmedApiKey) {
    nextErrors.apiKey = "请输入个人 API Key。";
  }

  return nextErrors;
}

export function useConnectPage(options: UseConnectPageOptions = {}) {
  const { redirectTo, persistOnSuccess = true } = options;
  const navigate = useNavigate();

  const redmineBaseUrl = useAppStore((state) => state.redmineBaseUrl);
  const apiKey = useAppStore((state) => state.apiKey);
  const setCredentials = useAppStore((state) => state.setCredentials);

  const [draftUrl, setDraftUrl] = useState(redmineBaseUrl);
  const [draftApiKey, setDraftApiKey] = useState(apiKey);
  const [rememberInstance, setRememberInstance] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [formErrors, setFormErrors] = useState<ConnectionFormErrors>({
    url: "",
    apiKey: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setDraftUrl(redmineBaseUrl);
    setDraftApiKey(apiKey);
  }, [redmineBaseUrl, apiKey]);

  const sanitizedBaseUrl = useMemo(() => {
    const value = draftUrl.trim();
    return value.endsWith("/") ? value.slice(0, -1) : value;
  }, [draftUrl]);

  const instanceHost = useMemo(() => {
    try {
      return sanitizedBaseUrl ? new URL(sanitizedBaseUrl).host : "awaiting-instance";
    } catch {
      return "awaiting-instance";
    }
  }, [sanitizedBaseUrl]);

  const testConnectionMutation = useMutation({
    mutationFn: async () =>
      getCurrentUser({
        baseUrl: draftUrl,
        apiKey: draftApiKey,
      }),
    onSuccess: (user) => {
      if (persistOnSuccess) {
        setCredentials({
          redmineBaseUrl: draftUrl,
          apiKey: draftApiKey,
          userName: user.name,
          userLogin: user.login,
        });
      }

      setSuccessMessage(`连接测试通过，当前用户：${user.name} (${user.login || "-"})`);

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      }
    },
    onError: () => {
      setSuccessMessage("");
    },
  });

  const onSubmit = () => {
    const nextErrors = validateConnectionForm(draftUrl, draftApiKey);
    setFormErrors(nextErrors);
    setSuccessMessage("");

    if (nextErrors.url || nextErrors.apiKey) {
      testConnectionMutation.reset();
      return;
    }

    testConnectionMutation.mutate();
  };

  const onDraftUrlChange = (value: string) => {
    setDraftUrl(value);
    if (formErrors.url) {
      setFormErrors((current) => ({ ...current, url: "" }));
    }
  };

  const onDraftApiKeyChange = (value: string) => {
    setDraftApiKey(value);
    if (formErrors.apiKey) {
      setFormErrors((current) => ({ ...current, apiKey: "" }));
    }
  };

  return {
    draftUrl,
    draftApiKey,
    rememberInstance,
    showApiKey,
    formErrors,
    successMessage,
    instanceHost,
    sanitizedBaseUrl,
    testConnectionMutation,
    setRememberInstance,
    setShowApiKey,
    onDraftUrlChange,
    onDraftApiKeyChange,
    onSubmit,
  };
}
