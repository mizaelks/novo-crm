
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Upload, RotateCcw, Settings, Package } from "lucide-react";
import { TemplateManagement } from "./TemplateManagement";
import { useUserRole } from "@/hooks/useUserRole";

interface SystemSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SystemSettingsDialog = ({ open, onOpenChange }: SystemSettingsDialogProps) => {
  const [autoBackup, setAutoBackup] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const { isAdmin, loading } = useUserRole();

  const handleExportData = () => {
    toast.success("Exportação de dados iniciada");
    // Implementar lógica de exportação
  };

  const handleImportData = () => {
    toast.info("Funcionalidade de importação em desenvolvimento");
    // Implementar lógica de importação
  };

  const handleResetDashboard = () => {
    // Resetar configurações do dashboard
    localStorage.removeItem('dashboard-layout');
    toast.success("Layout do dashboard resetado");
  };

  if (loading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Configurações do Sistema</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Notificações por email</Label>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-backup">Backup automático</Label>
                  <Switch
                    id="auto-backup"
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Aparência */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aparência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Modo escuro</Label>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dados e Backup */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dados e Backup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Button onClick={handleExportData} variant="outline" className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar dados do sistema
                  </Button>
                  <Button onClick={handleImportData} variant="outline" className="justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar dados
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={handleResetDashboard} variant="outline" className="justify-start">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Resetar layout do dashboard
                </Button>
              </CardContent>
            </Card>

            <Separator />

            {/* Informações do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Versão:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Última atualização:</span>
                  <span>{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Usuários ativos:</span>
                  <span>1</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6 overflow-y-auto max-h-[60vh]">
            <TemplateManagement isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SystemSettingsDialog;
