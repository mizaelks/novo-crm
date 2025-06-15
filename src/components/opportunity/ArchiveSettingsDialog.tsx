
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Clock, Trophy, X } from "lucide-react";
import { formatDateBRT } from "@/services/utils/dateUtils";
import { toast } from "sonner";

interface ArchiveSettings {
  enabled: boolean;
  period: number;
  lastRun: string | null;
  archiveWonOpportunities: boolean;
  archiveLostOpportunities: boolean;
}

interface ArchiveSettingsDialogProps {
  archiveSettings: ArchiveSettings;
  setArchiveSettings: (settings: ArchiveSettings) => void;
  processAutoArchive: () => Promise<number>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const ArchiveSettingsDialog = ({
  archiveSettings,
  setArchiveSettings,
  processAutoArchive,
  isOpen,
  setIsOpen
}: ArchiveSettingsDialogProps) => {
  const handleRunNow = async () => {
    const count = await processAutoArchive();
    if (count === 0) {
      toast.success("Nenhuma oportunidade foi arquivada");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" /> 
          Configurar arquivamento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações de arquivamento automático</DialogTitle>
          <DialogDescription>
            Configure quando oportunidades devem ser arquivadas automaticamente (execução mensal).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Ativar arquivamento automático</label>
              <p className="text-sm text-muted-foreground">
                Executa automaticamente a cada mês
              </p>
            </div>
            <Switch
              checked={archiveSettings.enabled}
              onCheckedChange={(checked) => setArchiveSettings({
                ...archiveSettings,
                enabled: checked
              })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Arquivar oportunidades mais antigas que
            </label>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                min="1"
                value={archiveSettings.period} 
                onChange={(e) => setArchiveSettings({
                  ...archiveSettings,
                  period: parseInt(e.target.value) || 30
                })}
                className="w-20"
                disabled={!archiveSettings.enabled}
              />
              <span className="text-sm">dias</span>
            </div>
          </div>

          <div className="space-y-3 border-t pt-3">
            <label className="text-sm font-medium">Tipos de oportunidades para arquivar:</label>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-600" />
                <span className="text-sm">Oportunidades ganhas</span>
              </div>
              <Switch
                checked={archiveSettings.archiveWonOpportunities}
                onCheckedChange={(checked) => setArchiveSettings({
                  ...archiveSettings,
                  archiveWonOpportunities: checked
                })}
                disabled={!archiveSettings.enabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-600" />
                <span className="text-sm">Oportunidades perdidas</span>
              </div>
              <Switch
                checked={archiveSettings.archiveLostOpportunities}
                onCheckedChange={(checked) => setArchiveSettings({
                  ...archiveSettings,
                  archiveLostOpportunities: checked
                })}
                disabled={!archiveSettings.enabled}
              />
            </div>
          </div>
          
          {archiveSettings.lastRun && (
            <div className="text-sm text-muted-foreground flex items-center gap-1 border-t pt-3">
              <Clock className="h-3 w-3" />
              <span>
                Última execução: {formatDateBRT(new Date(archiveSettings.lastRun))}
              </span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={handleRunNow} 
            disabled={!archiveSettings.enabled}
            className="w-full"
          >
            Executar agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveSettingsDialog;
