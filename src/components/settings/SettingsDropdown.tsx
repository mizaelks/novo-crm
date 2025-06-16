
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Trash2, Database, Users, Webhook, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FunnelManagementDialog from "./FunnelManagementDialog";
import { SystemSettingsDialog } from "./SystemSettingsDialog";
import { UserManagementDialog } from "./UserManagementDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGate } from "@/components/ui/permission-gate";

const SettingsDropdown = () => {
  const navigate = useNavigate();
  const [funnelDialogOpen, setFunnelDialogOpen] = useState(false);
  const [systemDialogOpen, setSystemDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const { canManageFunnels, canManageUsers, canSystemSettings } = usePermissions();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Configurações">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border shadow-md">
          <DropdownMenuLabel>Configurações do Sistema</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <PermissionGate permission="manage_funnels">
            <DropdownMenuItem onClick={() => setFunnelDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Gerenciar Funis
            </DropdownMenuItem>
          </PermissionGate>
          
          <PermissionGate permission="system_settings">
            <DropdownMenuItem onClick={() => setSystemDialogOpen(true)}>
              <Database className="mr-2 h-4 w-4" />
              Configurações Gerais
            </DropdownMenuItem>
          </PermissionGate>
          
          <PermissionGate permission="manage_users">
            <DropdownMenuItem onClick={() => setUserDialogOpen(true)}>
              <Users className="mr-2 h-4 w-4" />
              Usuários e Permissões
            </DropdownMenuItem>
          </PermissionGate>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Integrações</DropdownMenuLabel>
          
          <PermissionGate permission="system_settings">
            <DropdownMenuItem onClick={() => navigate("/webhooks")}>
              <Webhook className="mr-2 h-4 w-4" />
              Webhooks
            </DropdownMenuItem>
          </PermissionGate>
          
          <PermissionGate permission="system_settings">
            <DropdownMenuItem onClick={() => navigate("/api")}>
              <Code className="mr-2 h-4 w-4" />
              API
            </DropdownMenuItem>
          </PermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>

      <PermissionGate permission="manage_funnels">
        <FunnelManagementDialog 
          open={funnelDialogOpen} 
          onOpenChange={setFunnelDialogOpen} 
        />
      </PermissionGate>
      
      <PermissionGate permission="system_settings">
        <SystemSettingsDialog 
          isOpen={systemDialogOpen} 
          setIsOpen={setSystemDialogOpen} 
        />
      </PermissionGate>
      
      <PermissionGate permission="manage_users">
        <UserManagementDialog 
          isOpen={userDialogOpen} 
          setIsOpen={setUserDialogOpen} 
        />
      </PermissionGate>
    </>
  );
};

export default SettingsDropdown;
