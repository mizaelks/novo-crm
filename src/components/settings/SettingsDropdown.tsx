
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Trash2, Database, Users } from "lucide-react";
import { useState } from "react";
import FunnelManagementDialog from "./FunnelManagementDialog";
import SystemSettingsDialog from "./SystemSettingsDialog";

const SettingsDropdown = () => {
  const [funnelDialogOpen, setFunnelDialogOpen] = useState(false);
  const [systemDialogOpen, setSystemDialogOpen] = useState(false);

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
          <DropdownMenuItem>
            <Users className="mr-2 h-4 w-4" />
            Usuários e Permissões
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <FunnelManagementDialog 
        open={funnelDialogOpen} 
        onOpenChange={setFunnelDialogOpen} 
      />
      <SystemSettingsDialog 
        open={systemDialogOpen} 
        onOpenChange={setSystemDialogOpen} 
      />
    </>
  );
};

export default SettingsDropdown;
