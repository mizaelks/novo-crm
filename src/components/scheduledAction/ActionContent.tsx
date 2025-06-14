
import React from 'react';
import { ScheduledAction } from '@/types';
import { format } from 'date-fns';
import { ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { scheduledActionAPI } from '@/services/scheduledActionAPI';
import { toast } from 'sonner';

interface ActionContentProps {
  action: ScheduledAction;
  onActionUpdate?: (updatedAction: ScheduledAction) => void;
}

export const ActionContent: React.FC<ActionContentProps> = ({ action, onActionUpdate }) => {
  const handleCompleteTask = async () => {
    try {
      // Update the action status to completed
      const updatedAction = await scheduledActionAPI.update(action.id, {
        status: 'completed'
      });
      
      if (updatedAction) {
        toast.success('Tarefa concluída com sucesso!');
        if (onActionUpdate) {
          onActionUpdate(updatedAction);
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Erro ao concluir tarefa');
    }
  };

  const renderContent = () => {
    switch (action.actionType) {
      case 'webhook':
        return renderWebhookContent(action);
      case 'task':
        return renderTaskContent(action);
      case 'email':
        return renderEmailContent(action);
      default:
        return <div className="text-muted-foreground">Detalhes não disponíveis</div>;
    }
  };

  const renderWebhookContent = (action: ScheduledAction) => {
    const config = action.actionConfig;
    
    return (
      <div className="space-y-2">
        {config.description && (
          <p className="text-sm">
            {config.description}
          </p>
        )}
        
        <div className="text-sm">
          <span className="font-medium">URL:</span> {config.url}
        </div>
        
        <div className="text-sm">
          <span className="font-medium">Método:</span> {config.method || 'POST'}
        </div>

        {config.moveToNextStage && (
          <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
            <ArrowRight className="h-4 w-4" />
            <span>Movimentar para próxima etapa após execução</span>
          </div>
        )}
        
        {config.response && (
          <div className="mt-2 p-2 bg-muted rounded-md">
            <div className="text-sm">
              <span className="font-medium">Status:</span> {config.response.status}
            </div>
            {config.response.success !== undefined && (
              <div className="text-sm">
                <span className="font-medium">Sucesso:</span> {config.response.success ? 'Sim' : 'Não'}
              </div>
            )}
            {config.response.executed_at && (
              <div className="text-sm">
                <span className="font-medium">Executado em:</span> {format(new Date(config.response.executed_at), 'dd/MM/yyyy HH:mm')}
              </div>
            )}
            {config.response.error && (
              <div className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{config.response.error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTaskContent = (action: ScheduledAction) => {
    const config = action.actionConfig;
    
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium">
          {config.title || "Tarefa"}
        </div>
        
        {config.description && (
          <p className="text-sm">
            {config.description}
          </p>
        )}
        
        {config.assignedTo && (
          <div className="text-sm">
            <span className="font-medium">Responsável:</span> {config.assignedTo}
          </div>
        )}

        {config.moveToNextStage && (
          <div className="flex items-center gap-2 text-sm text-amber-600 mt-2">
            <ArrowRight className="h-4 w-4" />
            <span>Movimentar para próxima etapa após conclusão</span>
          </div>
        )}

        {/* Add Complete button for pending tasks */}
        {action.status === 'pending' && (
          <div className="pt-2">
            <Button 
              onClick={handleCompleteTask}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Concluir
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderEmailContent = (action: ScheduledAction) => {
    const config = action.actionConfig;
    
    return (
      <div className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Para:</span> {config.email}
        </div>
        
        {config.subject && (
          <div className="text-sm">
            <span className="font-medium">Assunto:</span> {config.subject}
          </div>
        )}
        
        {config.body && (
          <div className="text-sm mt-2">
            <span className="font-medium mb-1 block">Mensagem:</span>
            <div className="bg-muted p-2 rounded-md text-xs max-h-32 overflow-y-auto">
              {config.body}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderContent()}
    </div>
  );
};
