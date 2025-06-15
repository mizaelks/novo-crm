
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { enhancedToast } from "@/components/ui/enhanced-toast";
import { 
  Settings as SettingsIcon, 
  Palette, 
  Bell, 
  Globe, 
  Shield,
  Database,
  Mail
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { SettingsGeneral } from "@/components/settings/SettingsGeneral";
import { SettingsAppearance } from "@/components/settings/SettingsAppearance";
import { SettingsNotifications } from "@/components/settings/SettingsNotifications";
import { SettingsAutomation } from "@/components/settings/SettingsAutomation";

interface NotificationSettings {
  email: boolean;
  push: boolean;
  desktop: boolean;
  sound: boolean;
}

const Settings = () => {
  const [theme, setTheme] = useLocalStorage("theme", "system");
  const [notifications, setNotifications] = useLocalStorage<NotificationSettings>("notifications", {
    email: true,
    push: false,
    desktop: true,
    sound: false
  });
  const [language, setLanguage] = useLocalStorage("language", "pt-BR");
  const [autoArchive, setAutoArchive] = useLocalStorage("autoArchive", false);
  const [companyName, setCompanyName] = useLocalStorage("companyName", "");
  const [timezone, setTimezone] = useLocalStorage("timezone", "America/Sao_Paulo");

  const handleSave = () => {
    enhancedToast.success("Configurações salvas com sucesso!");
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value };
    setNotifications(updatedNotifications);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2 mb-8">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <SettingsGeneral 
        companyName={companyName}
        setCompanyName={setCompanyName}
        timezone={timezone}
        setTimezone={setTimezone}
        language={language}
        setLanguage={setLanguage}
      />

      <SettingsAppearance 
        theme={theme}
        setTheme={setTheme}
      />

      <SettingsNotifications 
        notifications={notifications}
        onNotificationChange={handleNotificationChange}
      />

      <SettingsAutomation 
        autoArchive={autoArchive}
        setAutoArchive={setAutoArchive}
      />

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} size="lg">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default Settings;
