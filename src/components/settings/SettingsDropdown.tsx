
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

const SettingsDropdown = () => {
  const navigate = useNavigate();
  const [funnelDialogOpen, setFunnelDialogOpen] = useState(false);
  const [systemDialogOpen, setSystemDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

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
          <DropdownMenuItem onClick={() => setFunnelDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Gerenciar Funis
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSystemDialogOpen(true)}>
            <Database className="mr-2 h-4 w-4" />
            Configurações Gerais
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUserDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" />
            Usuários e Permissões
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Integrações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate("/webhooks")}>
            <Webhook className="mr-2 h-4 w-4" />
            Webhooks
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/api")}>
            <Code className="mr-2 h-4 w-4" />
            API
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FunnelManagementDialog 
        open={funnelDialogOpen} 
        onOpenChange={setFunnelDialogOpen} 
      />
      <SystemSettingsDialog 
        isOpen={systemDialogOpen} 
        setIsOpen={setSystemDialogOpen} 
      />
      <UserManagementDialog 
        isOpen={userDialogOpen} 
        setIsOpen={setUserDialogOpen} 
      />
    </>
  );
};

export default SettingsDropdown;
