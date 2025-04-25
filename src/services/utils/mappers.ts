
import { Funnel, Stage, Opportunity, WebhookConfig, ScheduledAction, WebhookTemplate } from '@/types';
import { Json } from '@/integrations/supabase/types';
import { toBrasiliaTimezone } from './dateUtils';

export const mapDbFunnelToFunnel = (dbFunnel: any): Omit<Funnel, "stages"> => ({
  id: dbFunnel.id,
  name: dbFunnel.name,
  description: dbFunnel.description || '',
  order: dbFunnel.order || 0,
});

export const mapDbStageToStage = (dbStage: any): Omit<Stage, "opportunities"> => ({
  id: dbStage.id,
  name: dbStage.name,
  description: dbStage.description || '',
  order: dbStage.order || 0,
  funnelId: dbStage.funnel_id,
  color: dbStage.color || '#CCCCCC',
  isWinStage: dbStage.is_win_stage || false,
  isLossStage: dbStage.is_loss_stage || false,
  requiredFields: dbStage.required_fields ? mapDbRequiredFieldsToRequiredFields(dbStage.required_fields) : [],
});

export const mapDbRequiredFieldsToRequiredFields = (dbRequiredFields: any[]): any[] => {
  if (!dbRequiredFields || !Array.isArray(dbRequiredFields)) return [];
  
  return dbRequiredFields.map(field => ({
    id: field.id,
    name: field.name,
    type: field.type,
    options: field.options,
    isRequired: field.is_required,
    stageId: field.stage_id,
  }));
};

export const mapDbOpportunityToOpportunity = (dbOpportunity: any): Omit<Opportunity, "scheduledActions"> => ({
  id: dbOpportunity.id,
  title: dbOpportunity.title,
  value: dbOpportunity.value || 0,
  client: dbOpportunity.client || '',
  createdAt: toBrasiliaTimezone(dbOpportunity.created_at),
  stageId: dbOpportunity.stage_id,
  funnelId: dbOpportunity.funnel_id,
  company: dbOpportunity.company,
  phone: dbOpportunity.phone,
  email: dbOpportunity.email,
  customFields: dbOpportunity.custom_fields || {},
});

export const mapDbWebhookToWebhook = (dbWebhook: any): WebhookConfig => ({
  id: dbWebhook.id,
  targetType: dbWebhook.target_type as 'funnel' | 'stage' | 'opportunity',
  targetId: dbWebhook.target_id,
  url: dbWebhook.url,
  event: dbWebhook.event as 'create' | 'update' | 'move',
});

export const mapDbScheduledActionToScheduledAction = (dbAction: any): ScheduledAction => ({
  id: dbAction.id,
  opportunityId: dbAction.opportunity_id,
  actionType: dbAction.action_type as 'email' | 'webhook',
  actionConfig: dbAction.action_config as any,
  scheduledDateTime: toBrasiliaTimezone(dbAction.scheduled_datetime),
  status: dbAction.status as 'pending' | 'completed' | 'failed',
});

export const mapDbWebhookTemplateToWebhookTemplate = (dbTemplate: any): WebhookTemplate => ({
  id: dbTemplate.id,
  name: dbTemplate.name,
  description: dbTemplate.description || '',
  url: dbTemplate.url,
  targetType: dbTemplate.target_type as 'funnel' | 'stage' | 'opportunity',
  event: dbTemplate.event as 'create' | 'update' | 'move',
  payload: dbTemplate.payload,
  createdAt: toBrasiliaTimezone(dbTemplate.created_at),
});

// Add the formatCurrency function
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};
