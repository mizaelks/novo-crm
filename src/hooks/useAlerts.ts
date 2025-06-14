
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stageAPI } from '@/services/api';
import { funnelAPI } from '@/services/api';
import { scheduledActionAPI } from '@/services/api';
import { Opportunity, Stage, ScheduledAction } from '@/types';
import { shouldShowAlert, calculateDaysInStage } from '@/utils/stageAlerts';

export interface Alert {
  id: string;
  type: 'stage_deadline' | 'opportunity_stuck' | 'scheduled_task';
  title: string;
  description: string;
  opportunityId?: string;
  stageId?: string;
  funnelId?: string;
  scheduledActionId?: string;
  createdAt: Date;
  isRead: boolean;
  route: string; // Rota para navegar quando clicado
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Buscar todos os funis e etapas
  const { data: funnels } = useQuery({
    queryKey: ['funnels'],
    queryFn: funnelAPI.getAll,
  });

  // Buscar todas as ações agendadas
  const { data: scheduledActions } = useQuery({
    queryKey: ['scheduled-actions'],
    queryFn: scheduledActionAPI.getAll,
  });

  // Gerar alertas baseados nas configurações de etapas e ações agendadas
  useEffect(() => {
    console.log('Generating alerts for funnels:', funnels);
    console.log('Generating alerts for scheduled actions:', scheduledActions);
    const generatedAlerts: Alert[] = [];

    // Alertas de oportunidades paradas em etapas
    if (funnels) {
      funnels.forEach(funnel => {
        console.log(`Processing funnel: ${funnel.name} (ID: ${funnel.id})`);
        
        funnel.stages.forEach(stage => {
          console.log(`Processing stage: ${stage.name} (ID: ${stage.id}) in funnel ${funnel.id}`);
          console.log(`Stage alert config:`, stage.alertConfig);
          
          if (stage.alertConfig?.enabled) {
            console.log(`Alert config enabled for stage ${stage.name}`);
            
            stage.opportunities.forEach(opportunity => {
              console.log(`Checking opportunity: ${opportunity.title} (ID: ${opportunity.id})`);
              
              if (shouldShowAlert(opportunity, stage)) {
                const daysInStage = calculateDaysInStage(opportunity);
                console.log(`Creating stage alert for opportunity ${opportunity.title} in funnel ${funnel.id}`);
                
                const alert: Alert = {
                  id: `alert-${opportunity.id}-${stage.id}`,
                  type: 'opportunity_stuck',
                  title: `Oportunidade parada há ${daysInStage} dias`,
                  description: `"${opportunity.title}" está em "${stage.name}" há ${daysInStage} dias (limite: ${stage.alertConfig.maxDaysInStage} dias)`,
                  opportunityId: opportunity.id,
                  stageId: stage.id,
                  funnelId: funnel.id,
                  createdAt: new Date(),
                  isRead: false,
                  route: `/funnels/${funnel.id}`
                };
                
                console.log(`Stage alert created with route: ${alert.route}`);
                generatedAlerts.push(alert);
              }
            });
          }
        });
      });
    }

    // Alertas de tarefas agendadas
    if (scheduledActions && funnels) {
      const now = new Date();
      
      scheduledActions.forEach(action => {
        // Só gerar alertas para ações pendentes que já passaram da data agendada
        if (action.status === 'pending' && new Date(action.scheduledDateTime) <= now) {
          console.log(`Processing scheduled action: ${action.id}`);
          
          // Encontrar o funil da oportunidade
          let targetFunnel = null;
          let targetOpportunity = null;
          
          for (const funnel of funnels) {
            for (const stage of funnel.stages) {
              const opportunity = stage.opportunities.find(opp => opp.id === action.opportunityId);
              if (opportunity) {
                targetFunnel = funnel;
                targetOpportunity = opportunity;
                break;
              }
            }
            if (targetFunnel) break;
          }
          
          if (targetFunnel && targetOpportunity) {
            const alert: Alert = {
              id: `scheduled-${action.id}`,
              type: 'scheduled_task',
              title: getScheduledActionTitle(action),
              description: `Tarefa agendada para "${targetOpportunity.title}" está pendente desde ${new Date(action.scheduledDateTime).toLocaleDateString()}`,
              opportunityId: action.opportunityId,
              funnelId: targetFunnel.id,
              scheduledActionId: action.id,
              createdAt: new Date(),
              isRead: false,
              route: `/funnels/${targetFunnel.id}`
            };
            
            console.log(`Scheduled task alert created:`, alert);
            generatedAlerts.push(alert);
          }
        }
      });
    }

    console.log('Generated alerts:', generatedAlerts);
    setAlerts(generatedAlerts);
  }, [funnels, scheduledActions]);

  const markAsRead = (alertId: string) => {
    console.log(`Marking alert as read: ${alertId}`);
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  return {
    alerts,
    unreadCount,
    markAsRead
  };
};

// Função auxiliar para gerar título de ação agendada
const getScheduledActionTitle = (action: ScheduledAction): string => {
  switch (action.actionType) {
    case 'email':
      return '📧 Email pendente';
    case 'webhook':
      return '🔗 Webhook pendente';
    case 'task':
      return '📋 Tarefa pendente';
    default:
      return '⚠️ Ação pendente';
  }
};
