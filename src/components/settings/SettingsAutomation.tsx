
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Database } from "lucide-react";

interface SettingsAutomationProps {
  autoArchive: boolean;
  setAutoArchive: (value: boolean) => void;
}

export const SettingsAutomation = ({ autoArchive, setAutoArchive }: SettingsAutomationProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Automação
        </CardTitle>
        <CardDescription>
          Configure comportamentos automáticos do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-archive">Arquivamento Automático</Label>
            <p className="text-sm text-muted-foreground">
              Arquivar automaticamente oportunidades antigas
            </p>
          </div>
          <Switch
            id="auto-archive"
            checked={autoArchive}
            onCheckedChange={setAutoArchive}
          />
        </div>
      </CardContent>
    </Card>
  );
};
