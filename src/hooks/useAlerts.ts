
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stageAPI } from '@/services/api';
import { funnelAPI } from '@/services/api';
import { scheduledActionAPI } from '@/services/scheduledActionAPI';
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
  priority: number; // Novo campo para ordenação: 1 = atrasada, 2 = hoje, 3 = outros
  scheduledDate?: Date; // Novo campo para ajudar na ordenação
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
    refetchInterval: 30000, // Atualizar a cada 30 segundos
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
                  route: `/funnels/${funnel.id}`,
                  priority: 3 // Alertas de oportunidades têm prioridade baixa
                };
                
                console.log(`Stage alert created with route: ${alert.route}`);
                generatedAlerts.push(alert);
              }
            });
          }
        });
      });
    }

    // Alertas de tarefas agendadas pendentes e atrasadas
    if (scheduledActions && funnels) {
      const now = new Date();
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Final do dia atual
      
      scheduledActions.forEach(action => {
        // Gerar alertas para ações pendentes (incluindo as que ainda não venceram e as atrasadas)
        if (action.status === 'pending') {
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
            const scheduledDate = new Date(action.scheduledDateTime);
            const isOverdue = scheduledDate <= now;
            const isToday = scheduledDate <= today && scheduledDate >= new Date(today.getTime() - 24 * 60 * 60 * 1000);
            
            // Determinar prioridade
            let priority = 3; // padrão
            if (isOverdue) {
              priority = 1; // alta prioridade para atrasadas
            } else if (isToday) {
              priority = 2; // média prioridade para hoje
            }
            
            const alert: Alert = {
              id: `scheduled-${action.id}`,
              type: 'scheduled_task',
              title: isOverdue ? getOverdueTaskTitle(action) : getScheduledActionTitle(action),
              description: isOverdue 
                ? `Tarefa atrasada para "${targetOpportunity.title}" desde ${scheduledDate.toLocaleDateString()}`
                : `Tarefa agendada para "${targetOpportunity.title}" em ${scheduledDate.toLocaleDateString()}`,
              opportunityId: action.opportunityId,
              funnelId: targetFunnel.id,
              scheduledActionId: action.id,
              createdAt: new Date(),
              isRead: false,
              route: `/funnels/${targetFunnel.id}`,
              priority,
              scheduledDate
            };
            
            console.log(`Scheduled task alert created:`, alert);
            generatedAlerts.push(alert);
          }
        }
      });
    }

    // Ordenar alertas por prioridade e depois por data
    const sortedAlerts = generatedAlerts.sort((a, b) => {
      // Primeiro por prioridade (1 = alta, 2 = média, 3 = baixa)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Se mesma prioridade, ordenar por data agendada (mais antigo primeiro)
      if (a.scheduledDate && b.scheduledDate) {
        return a.scheduledDate.getTime() - b.scheduledDate.getTime();
      }
      
      // Se não tem data agendada, ordenar por data de criação
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    console.log('Generated alerts (sorted):', sortedAlerts);
    setAlerts(sortedAlerts);
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
      return '📧 Email agendado';
    case 'webhook':
      return '🔗 Webhook agendado';
    case 'task':
      return '📋 Tarefa agendada';
    default:
      return '⚠️ Ação agendada';
  }
};

// Função auxiliar para gerar título de ação atrasada
const getOverdueTaskTitle = (action: ScheduledAction): string => {
  switch (action.actionType) {
    case 'email':
      return '📧 Email atrasado';
    case 'webhook':
      return '🔗 Webhook atrasado';
    case 'task':
      return '📋 Tarefa atrasada';
    default:
      return '⚠️ Ação atrasada';
  }
};
