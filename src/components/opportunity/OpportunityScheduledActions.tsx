
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2, Play } from "lucide-react";
import { Opportunity, ScheduledAction } from "@/types";
import { scheduledActionAPI } from "@/services/api";
import { toast } from "sonner";
import { AddTaskDialog } from "./AddTaskDialog";

interface OpportunityScheduledActionsProps {
  opportunity: Opportunity;
  onOpportunityUpdated: (opportunity: Opportunity) => void;
}

const OpportunityScheduledActions = ({ 
  opportunity, 
  onOpportunityUpdated 
}: OpportunityScheduledActionsProps) => {
  const [actions, setActions] = useState<ScheduledAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    loadScheduledActions();
  }, [opportunity.id]);

  const loadScheduledActions = async () => {
    try {
      setLoading(true);
      const actionsData = await scheduledActionAPI.getByOpportunityId(opportunity.id);
      setActions(actionsData || []);
    } catch (error) {
      console.error("Error loading scheduled actions:", error);
      toast.error("Erro ao carregar ações agendadas");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    try {
      const success = await scheduledActionAPI.delete(actionId);
      if (success) {
        setActions(prev => prev.filter(action => action.id !== actionId));
        toast.success("Ação removida com sucesso");
      }
    } catch (error) {
      console.error("Error deleting action:", error);
      toast.error("Erro ao remover ação");
    }
  };

  const handleExecuteAction = async (actionId: string) => {
    try {
      // Execute the action via API
      toast.info("Executando ação...");
      // Reload actions to get updated status
      await loadScheduledActions();
    } catch (error) {
      console.error("Error executing action:", error);
      toast.error("Erro ao executar ação");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Concluída</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'email':
        return 'E-mail';
      case 'webhook':
        return 'Webhook';
      case 'task':
        return 'Tarefa';
      default:
        return type;
    }
  };

  const handleTaskAdded = () => {
    setIsAddDialogOpen(false);
    loadScheduledActions();
  };

  return (
    <>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ações Agendadas</h3>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ação
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : actions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma ação agendada para esta oportunidade.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agendar Primeira Ação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {actions.map((action) => (
              <Card key={action.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        {getActionTypeLabel(action.actionType)}
                      </CardTitle>
                      {getStatusBadge(action.status)}
                    </div>
                    <div className="flex gap-2">
                      {action.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExecuteAction(action.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAction(action.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(action.scheduledDateTime).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    {action.actionConfig?.title && (
                      <p className="text-sm">
                        <strong>Título:</strong> {action.actionConfig.title}
                      </p>
                    )}
                    
                    {action.actionConfig?.description && (
                      <p className="text-sm">
                        <strong>Descrição:</strong> {action.actionConfig.description}
                      </p>
                    )}
                    
                    {action.actionConfig?.url && (
                      <p className="text-sm">
                        <strong>URL:</strong> {action.actionConfig.url}
                      </p>
                    )}

                    {action.actionConfig?.response && (
                      <div className="mt-3 p-3 bg-muted rounded">
                        <p className="text-sm font-medium">Resposta:</p>
                        <p className="text-xs text-muted-foreground">
                          Status: {action.actionConfig.response.status || 'N/A'}
                        </p>
                        {action.actionConfig.response.error && (
                          <p className="text-xs text-destructive">
                            Erro: {action.actionConfig.response.error}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        opportunity={opportunity}
        onTaskAdded={handleTaskAdded}
      />
    </>
  );
};

export default OpportunityScheduledActions;
