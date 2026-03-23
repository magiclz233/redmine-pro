import { SaveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ConnectionCardProps {
  draftUrl: string;
  draftApiKey: string;
  saveMessage: string;
  onDraftUrlChange: (value: string) => void;
  onDraftApiKeyChange: (value: string) => void;
  onSave: () => void;
}

export function ConnectionCard(props: ConnectionCardProps) {
  const {
    draftUrl,
    draftApiKey,
    saveMessage,
    onDraftUrlChange,
    onDraftApiKeyChange,
    onSave,
  } = props;

  return (
    <Card>
      <CardHeader>
        <CardTitle>连接配置</CardTitle>
        <CardDescription>填写 Redmine 地址和 API Key 后即可直接访问你的 Redmine 数据。</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <Input
          value={draftUrl}
          onChange={(event) => onDraftUrlChange(event.target.value)}
          placeholder="https://redmine.rd.virsical.cn/"
        />
        <Input
          value={draftApiKey}
          onChange={(event) => onDraftApiKeyChange(event.target.value)}
          placeholder="输入 API Key"
          type="password"
        />
        <Button onClick={onSave}>
          <SaveIcon className="size-4" />
          保存配置
        </Button>
        {saveMessage ? <p className="text-xs text-muted-foreground md:col-span-3">{saveMessage}</p> : null}
      </CardContent>
    </Card>
  );
}
