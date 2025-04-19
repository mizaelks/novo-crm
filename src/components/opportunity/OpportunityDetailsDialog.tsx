
import { useState, useEffect } from "react";
import { opportunityAPI } from "@/services/api";
import { Opportunity, ScheduledAction } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock } from "lucide-react";
import { scheduledActionAPI } from "@/services/api";
import ScheduleActionForm from "../scheduledAction/ScheduleActionForm";

interface OpportunityDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
}

const OpportunityDetailsDialog = ({
  open,
  onOpenChange,
  opportunityId
}: OpportunityDetailsDialogProps) => {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [scheduledActions, setScheduledActions] = useState<ScheduledAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (open) {
        setLoading(true);
        try {
          const oppData = await opportunityAPI.getById(opportunityId);
          setOpportunity(oppData);
          
          const actionsData = await scheduledActionAPI.getByOpportunityId(opportunityId);
          setScheduledActions(actionsData);
        } catch (error) {
          console.error("Error loading opportunity details:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [open, opportunityId]);
  
  const handleScheduleAction = async (action: ScheduledAction) => {
    setScheduledActions([...scheduledActions, action]);
  };
  
  const handleExecuteAction = async (actionId: string) => {
    await scheduledActionAPI.execute(actionId);
    
    const updatedActions = scheduledActions.map(action => 
      action.id === actionId ? {...action, status: 'completed' as const} : action
    );
    
    setScheduledActions(updatedActions);
  };
  
  if (loading || !opportunity) {
    return null;
  }
  
  const formattedValue = new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(opportunity.value);
  
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(opportunity.createdAt));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{opportunity.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Cliente</p>
              <p className="font-medium">{opportunity.client}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="font-medium text-primary">{formattedValue}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Data de criação
              </p>
              <p className="text-sm">{formattedDate}</p>
            </div>
          </div>
          
          <Tabs defaultValue="actions">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="actions">Ações Agendadas</TabsTrigger>
              <TabsTrigger value="schedule">Agendar Nova</TabsTrigger>
            </TabsList>
            
            <TabsContent value="actions" className="space-y-4">
              {scheduledActions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma ação agendada para esta oportunidade</p>
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {scheduledActions.map(action => {
                    const actionDate = new Intl.DateTimeFormat('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(new Date(action.scheduledDateTime));
                    
                    return (
                      <div 
                        key={action.id} 
                        className={`p-3 border rounded-md ${
                          action.status === 'completed' ? 'bg-muted' : 'bg-white'
                        }`}
                      >
                        <div className="flex justify-between">
                          <div className="font-medium">
                            {action.actionType === 'email' ? 'Enviar e-mail' : 'Executar webhook'}
                          </div>
                          <div className={`text-xs ${
                            action.status === 'pending' ? 'text-primary' : 
                            action.status === 'completed' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {action.status === 'pending' ? 'Pendente' : 
                             action.status === 'completed' ? 'Concluído' : 'Falha'}
                          </div>
                        </div>
                        <div className="text-xs flex items-center mt-1 text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {actionDate}
                        </div>
                        <div className="mt-2 text-sm">
                          {action.actionType === 'email' && (
                            <div className="text-muted-foreground">
                              Para: {action.actionConfig.email}
                              <br />
                              Assunto: {action.actionConfig.subject}
                            </div>
                          )}
                          {action.actionType === 'webhook' && (
                            <div className="text-xs text-muted-foreground break-all">
                              URL: {action.actionConfig.url}
                            </div>
                          )}
                        </div>
                        {action.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleExecuteAction(action.id)}
                          >
                            Executar agora
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="schedule">
              <ScheduleActionForm 
                opportunityId={opportunityId} 
                onActionScheduled={handleScheduleAction}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityDetailsDialog;
