
import { Funnel, Stage, Opportunity, ScheduledAction, WebhookConfig } from "@/types";

// Mapeia um objeto de banco de dados para um objeto Funnel
export const mapDbFunnelToFunnel = (db: any): Funnel => {
  return {
    id: db.id,
    name: db.name,
    description: db.description || '',
    order: db.order || 0,
    stages: []
  };
};

// Mapeia um objeto de banco de dados para um objeto Stage
export const mapDbStageToStage = (db: any): Stage => {
  return {
    id: db.id,
    name: db.name,
    description: db.description || '',
    order: db.order || 0,
    funnelId: db.funnel_id,
    opportunities: [],
    color: db.color || '#CCCCCC',
    isWinStage: db.is_win_stage || false,
    isLossStage: db.is_loss_stage || false,
    requiredFields: []
  };
};

// Mapeia um objeto de banco de dados para um objeto Opportunity
export const mapDbOpportunityToOpportunity = (db: any): Opportunity => {
  // Ensure date is properly parsed
  const createdAt = db.created_at ? new Date(db.created_at) : new Date();
  
  // Ensure custom_fields is properly parsed from JSON
  let customFields = {};
  if (db.custom_fields) {
    try {
      // Se já for um objeto, use-o diretamente
      if (typeof db.custom_fields === 'object' && db.custom_fields !== null) {
        customFields = db.custom_fields;
      } else {
        // Se for uma string JSON, analise-a
        customFields = JSON.parse(db.custom_fields);
      }
    } catch (e) {
      console.error("Erro ao analisar campos personalizados:", e);
      console.error("Valor recebido:", db.custom_fields);
      customFields = {};
    }
  }
  
  return {
    id: db.id,
    title: db.title,
    value: parseFloat(db.value || 0),
    client: db.client || '',
    createdAt: createdAt,
    stageId: db.stage_id,
    funnelId: db.funnel_id,
    scheduledActions: [],
    phone: db.phone || '',
    email: db.email || '',
    company: db.company || '',
    customFields: customFields
  };
};

// Mapeia um objeto de banco de dados para um objeto ScheduledAction
export const mapDbScheduledActionToScheduledAction = (db: any): ScheduledAction => {
  // Ensure date is properly parsed
  const scheduledDateTime = db.scheduled_datetime ? new Date(db.scheduled_datetime) : new Date();
  
  // Parse action_config if it's a string
  let actionConfig = {};
  if (db.action_config) {
    try {
      if (typeof db.action_config === 'object' && db.action_config !== null) {
        actionConfig = db.action_config;
      } else {
        actionConfig = JSON.parse(db.action_config);
      }
    } catch (e) {
      console.error("Error parsing action_config:", e);
      actionConfig = {};
    }
  }

  return {
    id: db.id,
    opportunityId: db.opportunity_id,
    actionType: db.action_type,
    actionConfig: actionConfig,
    scheduledDateTime: scheduledDateTime,
    status: db.status || 'pending'
  };
};

// Mapeia um objeto de banco de dados para um objeto WebhookConfig
export const mapDbWebhookToWebhook = (db: any): WebhookConfig => {
  return {
    id: db.id,
    targetType: db.target_type,
    targetId: db.target_id,
    url: db.url,
    event: db.event
  };
};

// Utility function to format currency values
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
