
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, AlertTriangle } from "lucide-react";
import { funnelAPI } from "@/services/api";
import { Funnel } from "@/types";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

interface FunnelManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FunnelManagementDialog = ({ open, onOpenChange }: FunnelManagementDialogProps) => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const { showConfirmation, ConfirmDialog } = useConfirmDialog();

  useEffect(() => {
    if (open) {
      loadFunnels();
    }
  }, [open]);

  const loadFunnels = async () => {
    try {
      const data = await funnelAPI.getAll();
      setFunnels(data);
    } catch (error) {
      console.error("Error loading funnels:", error);
      toast.error("Erro ao carregar funis");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFunnel = async (funnel: Funnel) => {
    const totalOpportunities = funnel.stages.reduce(
      (total, stage) => total + stage.opportunities.length, 
      0
    );

    const confirmed = await showConfirmation(
      "Excluir Funil",
      `Tem certeza que deseja excluir o funil "${funnel.name}"? Esta ação irá excluir ${totalOpportunities} oportunidades e não pode ser desfeita.`
    );

    if (confirmed) {
      try {
        await funnelAPI.delete(funnel.id);
        setFunnels(funnels.filter(f => f.id !== funnel.id));
        toast.success("Funil excluído com sucesso");
      } catch (error) {
        console.error("Error deleting funnel:", error);
        toast.error("Erro ao excluir funil");
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Funis</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                Cuidado: Excluir um funil irá remover todas as etapas e oportunidades associadas.
              </span>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {funnels.map((funnel) => {
                  const totalOpportunities = funnel.stages.reduce(
                    (total, stage) => total + stage.opportunities.length, 
                    0
                  );

                  return (
                    <Card key={funnel.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{funnel.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            <p>{funnel.stages.length} etapas • {totalOpportunities} oportunidades</p>
                            {funnel.description && (
                              <p className="mt-1">{funnel.description}</p>
                            )}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteFunnel(funnel)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {funnels.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum funil encontrado
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog />
    </>
  );
};

export default FunnelManagementDialog;
