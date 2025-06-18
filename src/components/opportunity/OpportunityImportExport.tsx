
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, User } from "lucide-react";
import { Opportunity, Funnel, Stage } from "@/types";
import { opportunityAPI } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUsers } from "@/hooks/useUsers";

interface OpportunityImportExportProps {
  opportunities: Opportunity[];
  funnels: Funnel[];
  stages: Stage[];
  onImportComplete?: () => void;
}

export const OpportunityImportExport = ({
  opportunities,
  funnels,
  stages,
  onImportComplete
}: OpportunityImportExportProps) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedFunnel, setSelectedFunnel] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const { user } = useAuth();
  const { canManageUsers, isAdmin, isManager } = usePermissions();
  const { users } = useUsers();

  // Admin and manager can assign to other users
  const canAssignToOthers = isAdmin || isManager || canManageUsers;

  const availableStages = selectedFunnel 
    ? stages.filter(stage => stage.funnelId === selectedFunnel)
    : [];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast.error("Por favor, selecione um arquivo CSV válido");
    }
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });
  };

  const handleImport = async () => {
    if (!csvFile || !selectedFunnel || !selectedStage) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // For non-admin/manager users, auto-assign to themselves
    const assignedUserId = canAssignToOthers && selectedUser ? selectedUser : user?.id;
    
    if (!assignedUserId) {
      toast.error("Usuário para atribuição não encontrado");
      return;
    }

    setIsImporting(true);
    try {
      const csvText = await csvFile.text();
      const csvData = parseCSV(csvText);
      
      let importedCount = 0;
      let errors: string[] = [];

      for (const row of csvData) {
        try {
          const opportunityData = {
            title: row.title || row.titulo || 'Importado',
            client: row.client || row.cliente || '',
            company: row.company || row.empresa || '',
            email: row.email || '',
            phone: row.phone || row.telefone || '',
            value: parseFloat(row.value || row.valor || '0') || 0,
            funnelId: selectedFunnel,
            stageId: selectedStage,
            userId: assignedUserId
          };

          await opportunityAPI.create(opportunityData);
          importedCount++;
        } catch (error) {
          console.error('Error importing row:', error);
          errors.push(`Erro na linha: ${row.title || row.titulo || 'sem título'}`);
        }
      }

      if (importedCount > 0) {
        toast.success(`${importedCount} oportunidades importadas com sucesso!`);
        onImportComplete?.();
        setImportDialogOpen(false);
        setCsvFile(null);
        setSelectedFunnel("");
        setSelectedStage("");
        setSelectedUser("");
      }

      if (errors.length > 0) {
        toast.error(`${errors.length} erros durante a importação`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error("Erro ao importar arquivo CSV");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = () => {
    if (opportunities.length === 0) {
      toast.error("Nenhuma oportunidade para exportar");
      return;
    }

    const headers = ['title', 'client', 'company', 'email', 'phone', 'value', 'funnel', 'stage', 'created_at'];
    const csvContent = [
      headers.join(','),
      ...opportunities.map(opp => [
        opp.title,
        opp.client,
        opp.company || '',
        opp.email || '',
        opp.phone || '',
        opp.value || 0,
        funnels.find(f => f.id === opp.funnelId)?.name || '',
        stages.find(s => s.id === opp.stageId)?.name || '',
        new Date(opp.createdAt).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `oportunidades_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Arquivo CSV exportado com sucesso!");
    setExportDialogOpen(false);
  };

  // Create display name from first_name and last_name
  const getUserDisplayName = (user: any) => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim() || user.email || 'Usuário sem nome';
  };

  const selectedUserName = users?.find(u => u.id === selectedUser) 
    ? getUserDisplayName(users.find(u => u.id === selectedUser)) 
    : '';

  return (
    <div className="flex gap-2">
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Importar Oportunidades</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Arquivo CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Colunas esperadas: title, client, company, email, phone, value
              </p>
            </div>

            <div>
              <Label>Funil de Destino *</Label>
              <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um funil" />
                </SelectTrigger>
                <SelectContent>
                  {funnels.map(funnel => (
                    <SelectItem key={funnel.id} value={funnel.id}>
                      {funnel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Etapa de Destino *</Label>
              <Select 
                value={selectedStage} 
                onValueChange={setSelectedStage}
                disabled={!selectedFunnel}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma etapa" />
                </SelectTrigger>
                <SelectContent>
                  {availableStages.map(stage => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {canAssignToOthers && (
              <div>
                <Label>Atribuir para Usuário</Label>
                <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={userSearchOpen}
                      className="w-full justify-between mt-1"
                    >
                      {selectedUserName || "Selecione um usuário..."}
                      <User className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar usuário..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                        <CommandGroup>
                          {users && users.length > 0 ? users.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={getUserDisplayName(user)}
                              onSelect={() => {
                                setSelectedUser(user.id);
                                setUserSearchOpen(false);
                              }}
                            >
                              {getUserDisplayName(user)} ({user.email})
                            </CommandItem>
                          )) : null}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-1">
                  Deixe vazio para atribuir automaticamente a você
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleImport}
                disabled={!csvFile || !selectedFunnel || !selectedStage || isImporting}
                className="flex-1"
              >
                {isImporting ? "Importando..." : "Importar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setImportDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Exportar Oportunidades</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Exportar {opportunities.length} oportunidades para CSV?
            </p>
            <p className="text-xs text-muted-foreground">
              O arquivo incluirá: título, cliente, empresa, email, telefone, valor, funil, etapa e data de criação.
            </p>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleExport} className="flex-1">
                Exportar
              </Button>
              <Button
                variant="outline"
                onClick={() => setExportDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
