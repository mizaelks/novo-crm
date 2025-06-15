
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
import { Settings, Clock } from "lucide-react";
import { formatDateBRT } from "@/services/utils/dateUtils";

interface ArchiveSettings {
  enabled: boolean;
  period: number;
  lastRun: string | null;
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações de arquivamento automático</DialogTitle>
          <DialogDescription>
            Configure quando oportunidades devem ser arquivadas automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm font-medium">Ativar arquivamento automático</label>
              <p className="text-sm text-muted-foreground">
                Arquiva automaticamente oportunidades antigas
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
              />
              <span>dias</span>
            </div>
          </div>
          
          {archiveSettings.lastRun && (
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                Última execução: {formatDateBRT(new Date(archiveSettings.lastRun))}
              </span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={processAutoArchive} disabled={!archiveSettings.enabled}>
            Executar agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveSettingsDialog;
