
import { useState, useEffect } from "react";
import { ScheduledAction } from "@/types";
import { scheduledActionAPI } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface ScheduledActionListProps {
  opportunityId: string;
}

const ScheduledActionList = ({ opportunityId }: ScheduledActionListProps) => {
  const [actions, setActions] = useState<ScheduledAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionToDelete, setActionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadActions = async () => {
    try {
      setLoading(true);
      const fetchedActions = await scheduledActionAPI.getByOpportunityId(opportunityId);
      setActions(fetchedActions);
    } catch (error) {
      console.error("Error loading scheduled actions:", error);
      toast.error("Erro ao carregar ações agendadas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, [opportunityId]);

  const handleDeleteAction = async () => {
    if (!actionToDelete) return;
    
    try {
      setIsDeleting(true);
      const success = await scheduledActionAPI.delete(actionToDelete);
      if (success) {
        setActions(actions.filter(action => action.id !== actionToDelete));
        toast.success("Ação agendada excluída com sucesso");
        setActionToDelete(null);
      } else {
        toast.error("Erro ao excluir ação agendada");
      }
    } catch (error) {
      console.error("Error deleting scheduled action:", error);
      toast.error("Erro ao excluir ação agendada");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluído
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Falhou
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatActionType = (type: string) => {
    switch (type) {
      case 'webhook':
        return 'Webhook';
      case 'email':
        return 'Email';
      case 'notification':
        return 'Notificação';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando ações agendadas...</span>
      </div>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Nenhuma ação agendada encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actions.map((action) => (
        <Card key={action.id} className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base">{formatActionType(action.actionType)}</CardTitle>
                <CardDescription>
                  Agendado para: {format(new Date(action.scheduledDateTime), "dd/MM/yyyy HH:mm")}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(action.status)}
                {action.status === 'pending' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-destructive" 
                    onClick={() => setActionToDelete(action.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm">
              {action.actionType === 'webhook' && action.actionConfig && (
                <>
                  <p><strong>URL:</strong> {action.actionConfig.url}</p>
                  {action.actionConfig.method && (
                    <p><strong>Método:</strong> {action.actionConfig.method}</p>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!actionToDelete} onOpenChange={(open) => !open && setActionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir ação agendada</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta ação agendada?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionToDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAction}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduledActionList;
