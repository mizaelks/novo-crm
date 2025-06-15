
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Share2, Database } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { UserManagementDialog } from "./UserManagementDialog";
import { FunnelSharingSettings } from "./FunnelSharingSettings";
import { SettingsAutomation } from "./SettingsAutomation";

interface SystemSettingsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const SystemSettingsDialog = ({ isOpen, setIsOpen }: SystemSettingsDialogProps) => {
  const [userManagementOpen, setUserManagementOpen] = useState(false);
  const [autoArchive, setAutoArchive] = useState(false);
  const { isAdmin, isManager } = useUserRole();

  // Usuários comuns não têm acesso às configurações do sistema
  if (!isManager && !isAdmin) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações do Sistema
            </DialogTitle>
            <DialogDescription>
              Gerencie configurações avançadas do sistema
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="sharing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sharing" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Compartilhamento
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Usuários
                </TabsTrigger>
              )}
              <TabsTrigger value="automation" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Automação
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sharing" className="space-y-4">
              <FunnelSharingSettings />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="users" className="space-y-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Gerencie usuários, papéis e permissões do sistema
                  </p>
                  <Button onClick={() => setUserManagementOpen(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Abrir Gerenciamento de Usuários
                  </Button>
                </div>
              </TabsContent>
            )}

            <TabsContent value="automation" className="space-y-4">
              <SettingsAutomation 
                autoArchive={autoArchive}
                setAutoArchive={setAutoArchive}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <UserManagementDialog
        isOpen={userManagementOpen}
        setIsOpen={setUserManagementOpen}
      />
    </>
  );
};
