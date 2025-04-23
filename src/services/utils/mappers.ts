
import { Funnel, Stage, Opportunity, WebhookConfig, ScheduledAction } from '@/types';
import { Json } from '@/integrations/supabase/types';

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
});

export const mapDbOpportunityToOpportunity = (dbOpportunity: any): Omit<Opportunity, "scheduledActions"> => ({
  id: dbOpportunity.id,
  title: dbOpportunity.title,
  value: dbOpportunity.value || 0,
  client: dbOpportunity.client || '',
  createdAt: new Date(dbOpportunity.created_at),
  stageId: dbOpportunity.stage_id,
  funnelId: dbOpportunity.funnel_id,
  company: dbOpportunity.company,  // Ensure these fields are included
  phone: dbOpportunity.phone,
  email: dbOpportunity.email,
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
  scheduledDateTime: new Date(dbAction.scheduled_datetime),
  status: dbAction.status as 'pending' | 'completed' | 'failed',
});
