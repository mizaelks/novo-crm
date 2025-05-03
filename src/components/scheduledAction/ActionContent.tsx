
import React from 'react';
import { ScheduledAction } from '@/types';
import { format } from 'date-fns';
import { ArrowRight, AlertTriangle } from 'lucide-react';

interface ActionContentProps {
  action: ScheduledAction;
}

export const ActionContent: React.FC<ActionContentProps> = ({ action }) => {
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
      <div className="space-y-2">
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
