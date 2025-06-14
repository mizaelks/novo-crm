
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stageAPI } from '@/services/api';
import { funnelAPI } from '@/services/api';
import { Opportunity, Stage } from '@/types';
import { shouldShowAlert, calculateDaysInStage } from '@/utils/stageAlerts';

export interface Alert {
  id: string;
  type: 'stage_deadline' | 'opportunity_stuck';
  title: string;
  description: string;
  opportunityId?: string;
  stageId?: string;
  funnelId?: string;
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

  // Gerar alertas baseados nas configurações de etapas e oportunidades
  useEffect(() => {
    if (!funnels) return;

    console.log('Generating alerts for funnels:', funnels);
    const generatedAlerts: Alert[] = [];

    funnels.forEach(funnel => {
      console.log(`Processing funnel: ${funnel.name} (ID: ${funnel.id})`);
      
      funnel.stages.forEach(stage => {
        console.log(`Processing stage: ${stage.name} (ID: ${stage.id}) in funnel ${funnel.id}`);
        
        if (stage.alertConfig?.enabled) {
          console.log(`Alert config enabled for stage ${stage.name}`);
          
          stage.opportunities.forEach(opportunity => {
            console.log(`Checking opportunity: ${opportunity.title} (ID: ${opportunity.id})`);
            
            if (shouldShowAlert(opportunity, stage)) {
              const daysInStage = calculateDaysInStage(opportunity);
              console.log(`Creating alert for opportunity ${opportunity.title} in funnel ${funnel.id}`);
              
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
                route: `/funnels/${funnel.id}` // Usar o ID correto do funil
              };
              
              console.log(`Alert created with route: ${alert.route}`);
              generatedAlerts.push(alert);
            }
          });
        }
      });
    });

    console.log('Generated alerts:', generatedAlerts);
    setAlerts(generatedAlerts);
  }, [funnels]);

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
