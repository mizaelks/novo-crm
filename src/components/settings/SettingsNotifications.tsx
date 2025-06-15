
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell } from "lucide-react";

interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  sound: boolean;
}

interface SettingsNotificationsProps {
  notifications: NotificationSettings;
  onNotificationChange: (key: keyof NotificationSettings, value: boolean) => void;
}

export const SettingsNotifications = ({ 
  notifications, 
  onNotificationChange 
}: SettingsNotificationsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações
        </CardTitle>
        <CardDescription>
          Configure como você gostaria de receber notificações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Notificações por Email</Label>
            <p className="text-sm text-muted-foreground">
              Receba atualizações importantes por email
            </p>
          </div>
          <Switch
            id="email-notifications"
            checked={notifications.email}
            onCheckedChange={(value) => onNotificationChange('email', value)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="desktop-notifications">Notificações Desktop</Label>
            <p className="text-sm text-muted-foreground">
              Receba notificações no navegador
            </p>
          </div>
          <Switch
            id="desktop-notifications"
            checked={notifications.desktop}
            onCheckedChange={(value) => onNotificationChange('desktop', value)}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sound-notifications">Som das Notificações</Label>
            <p className="text-sm text-muted-foreground">
              Reproduzir som quando receber notificações
            </p>
          </div>
          <Switch
            id="sound-notifications"
            checked={notifications.sound}
            onCheckedChange={(value) => onNotificationChange('sound', value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
