
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download, Upload, FileSpreadsheet, Search } from "lucide-react";
import { opportunityAPI, funnelAPI, stageAPI } from "@/services/api";
import { Opportunity, Funnel, Stage } from "@/types";
import { useUsers } from "@/hooks/useUsers";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpportunityImportExportProps {
  opportunities: Opportunity[];
  funnels: Funnel[];
  stages: Stage[];
  onImportComplete: () => void;
}

export const OpportunityImportExport = ({ 
  opportunities, 
  funnels, 
  stages, 
  onImportComplete 
}: OpportunityImportExportProps) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [userSelectorOpen, setUserSelectorOpen] = useState(false);

  const { users } = useUsers();
  const { hasAnyPermission } = usePermissions();
  const { user } = useAuth();

  // Check if user can assign to others (admin or manager)
  const canAssignToOthers = hasAnyPermission(['edit_all_opportunities', 'manage_users']);

  // Get stages for selected funnel
  const availableStages = selectedFunnel 
    ? stages.filter(stage => stage.funnelId === selectedFunnel)
    : [];

  // Get available users for assignment
  const availableUsers = canAssignToOthers ? users : users.filter(u => u.id === user?.id);

  const handleExportCSV = () => {
    const csvHeaders = [
      'titulo',
      'cliente', 
      'valor',
      'telefone',
      'email',
      'empresa',
      'funil',
      'etapa',
      'data_criacao'
    ];

    const csvRows = opportunities.map(opp => {
      const funnel = funnels.find(f => f.id === opp.funnelId);
      const stage = stages.find(s => s.id === opp.stageId);
      
      return [
        `"${opp.title || ''}"`,
        `"${opp.client || ''}"`,
        opp.value || 0,
        `"${opp.phone || ''}"`,
        `"${opp.email || ''}"`,
        `"${opp.company || ''}"`,
        `"${funnel?.name || ''}"`,
        `"${stage?.name || ''}"`,
        new Date(opp.createdAt).toLocaleDateString('pt-BR')
      ].join(',');
    });

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
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
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      toast.error("Por favor, selecione um arquivo CSV válido");
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile || !selectedFunnel || !selectedStage) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // If user can't assign to others, always assign to themselves
    const assignToUserId = canAssignToOthers ? selectedUser || user?.id : user?.id;

    setImporting(true);
    
    try {
      const text = await csvFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const importedOpportunities = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        const oppData: any = {};
        
        headers.forEach((header, index) => {
          if (values[index]) {
            switch (header.toLowerCase()) {
              case 'titulo':
                oppData.title = values[index];
                break;
              case 'cliente':
                oppData.client = values[index];
                break;
              case 'valor':
                oppData.value = parseFloat(values[index]) || 0;
                break;
              case 'telefone':
                oppData.phone = values[index];
                break;
              case 'email':
                oppData.email = values[index];
                break;
              case 'empresa':
                oppData.company = values[index];
                break;
            }
          }
        });

        if (oppData.title && oppData.client) {
          oppData.stageId = selectedStage;
          oppData.funnelId = selectedFunnel;
          oppData.userId = assignToUserId;
          
          importedOpportunities.push(oppData);
        }
      }

      // Create opportunities
      let successCount = 0;
      for (const oppData of importedOpportunities) {
        try {
          await opportunityAPI.create(oppData);
          successCount++;
        } catch (error) {
          console.error('Error creating opportunity:', error);
        }
      }

      toast.success(`${successCount} oportunidades importadas com sucesso!`);
      setImportDialogOpen(false);
      setCsvFile(null);
      setSelectedFunnel("");
      setSelectedStage("");
      setSelectedUser("");
      onImportComplete();
      
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error("Erro ao importar arquivo CSV");
    } finally {
      setImporting(false);
    }
  };

  const selectedUserData = users.find(u => u.id === selectedUser);

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExportCSV} className="gap-2">
        <Download className="h-4 w-4" />
        Exportar CSV
      </Button>
      
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Importar CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Importar Oportunidades via CSV
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="funnel">Funil de Destino *</Label>
              <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o funil" />
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
              <Label htmlFor="stage">Etapa de Destino *</Label>
              <Select 
                value={selectedStage} 
                onValueChange={setSelectedStage}
                disabled={!selectedFunnel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a etapa" />
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
                <Label htmlFor="user">Atribuir a Usuário</Label>
                <Popover open={userSelectorOpen} onOpenChange={setUserSelectorOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={userSelectorOpen}
                      className="w-full justify-between"
                    >
                      {selectedUser
                        ? `${selectedUserData?.first_name || ''} ${selectedUserData?.last_name || ''} (${selectedUserData?.email})`
                        : "Selecione um usuário (opcional)"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar usuário..." />
                      <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                      <CommandGroup>
                        {availableUsers.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={`${user.first_name} ${user.last_name} ${user.email}`}
                            onSelect={() => {
                              setSelectedUser(user.id === selectedUser ? "" : user.id);
                              setUserSelectorOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUser === user.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {user.first_name} {user.last_name} ({user.email})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground mt-1">
                  Se não selecionado, será atribuído a você
                </p>
              </div>
            )}

            {!canAssignToOthers && (
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                As oportunidades importadas serão automaticamente atribuídas a você.
              </div>
            )}

            <div>
              <Label htmlFor="csv-file">Arquivo CSV *</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Colunas esperadas: titulo, cliente, valor, telefone, email, empresa
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleImportCSV} disabled={importing}>
                {importing ? "Importando..." : "Importar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
