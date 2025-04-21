
import {
  Funnel,
  Stage,
  Opportunity,
  WebhookConfig,
  ScheduledAction,
  FunnelFormData,
  StageFormData,
  OpportunityFormData,
  WebhookFormData,
  ScheduledActionFormData,
  WebhookPayload,
} from '../types';
import { supabase } from "@/integrations/supabase/client";
import { Json } from '@/integrations/supabase/types';

// Data mapping functions to convert between database and application models
const mapDbFunnelToFunnel = (dbFunnel: any): Funnel => {
  return {
    id: dbFunnel.id,
    name: dbFunnel.name,
    description: dbFunnel.description || '',
    order: dbFunnel.order || 0,
    stages: [], // Will be populated separately
  };
};

const mapDbStageToStage = (dbStage: any): Stage => {
  return {
    id: dbStage.id,
    name: dbStage.name,
    description: dbStage.description || '',
    order: dbStage.order || 0,
    funnelId: dbStage.funnel_id,
    opportunities: [], // Will be populated separately
  };
};

const mapDbOpportunityToOpportunity = (dbOpportunity: any): Opportunity => {
  return {
    id: dbOpportunity.id,
    title: dbOpportunity.title,
    value: dbOpportunity.value || 0,
    client: dbOpportunity.client || '',
    createdAt: new Date(dbOpportunity.created_at),
    stageId: dbOpportunity.stage_id,
    funnelId: dbOpportunity.funnel_id,
    scheduledActions: [], // Will be populated separately
  };
};

const mapDbWebhookToWebhook = (dbWebhook: any): WebhookConfig => {
  return {
    id: dbWebhook.id,
    targetType: dbWebhook.target_type as 'funnel' | 'stage' | 'opportunity',
    targetId: dbWebhook.target_id,
    url: dbWebhook.url,
    event: dbWebhook.event as 'create' | 'update' | 'move',
  };
};

const mapDbScheduledActionToScheduledAction = (dbAction: any): ScheduledAction => {
  return {
    id: dbAction.id,
    opportunityId: dbAction.opportunity_id,
    actionType: dbAction.action_type as 'email' | 'webhook',
    actionConfig: dbAction.action_config || {},
    scheduledDateTime: new Date(dbAction.scheduled_datetime),
    status: dbAction.status as 'pending' | 'completed' | 'failed',
  };
};

// Webhook dispatch simulation (could be updated later for real external calls)
const dispatchWebhook = async (payload: WebhookPayload, url: string) => {
  console.log(`Dispatching webhook to ${url}`, payload);
  // TODO: Implement real external call if desired
  return { success: true, url };
};

const triggerEntityWebhooks = async (
  entityType: 'funnel' | 'stage' | 'opportunity',
  entityId: string,
  eventType: 'create' | 'update' | 'move',
  data: any
) => {
  const { data: webhooks, error } = await supabase
    .from('webhooks')
    .select('*')
    .eq('target_type', entityType)
    .eq('target_id', entityId)
    .eq('event', eventType);

  if (error) {
    console.error("Failed to fetch webhooks:", error);
    return { dispatched: 0 };
  }

  const eventName = `${entityType}.${eventType}`;
  const payload: WebhookPayload = {
    event: eventName,
    data,
  };

  const promises = (webhooks ?? []).map(webhook => dispatchWebhook(payload, webhook.url));
  await Promise.all(promises);

  return { dispatched: promises.length };
};

// --- FUNNEL API ---
export const funnelAPI = {
  getAll: async (): Promise<Funnel[]> => {
    const { data, error } = await supabase.from('funnels').select('*').order('order', { ascending: true });
    if (error) throw error;
    
    // Map database objects to application objects
    const funnels: Funnel[] = (data || []).map(mapDbFunnelToFunnel);
    
    // For each funnel, fetch its stages & opportunities
    for (const funnel of funnels) {
      funnel.stages = await stageAPI.getByFunnelId(funnel.id);
    }
    
    return funnels;
  },

  getById: async (id: string): Promise<Funnel | null> => {
    const { data, error } = await supabase.from('funnels').select('*').eq('id', id).single();
    if (error || !data) return null;
    
    const funnel = mapDbFunnelToFunnel(data);
    funnel.stages = await stageAPI.getByFunnelId(data.id);
    
    return funnel;
  },

  create: async (data: FunnelFormData): Promise<Funnel> => {
    const { data: created, error } = await supabase.from('funnels').insert([
      { name: data.name, description: data.description }
    ]).select().single();
    
    if (error || !created) throw error || new Error("Funnel create error");
    
    const funnel = mapDbFunnelToFunnel(created);
    funnel.stages = [];
    
    await triggerEntityWebhooks('funnel', created.id, 'create', created);
    return funnel;
  },

  update: async (id: string, data: Partial<FunnelFormData>): Promise<Funnel | null> => {
    const { data: updated, error } = await supabase.from('funnels').update(data).eq('id', id).select().single();
    if (error || !updated) return null;
    
    await triggerEntityWebhooks('funnel', id, 'update', updated);
    
    const funnel = mapDbFunnelToFunnel(updated);
    funnel.stages = await stageAPI.getByFunnelId(id);
    
    return funnel;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('funnels').delete().eq('id', id);
    return !error;
  }
};

// --- STAGE API ---
export const stageAPI = {
  getAll: async (): Promise<Stage[]> => {
    const { data, error } = await supabase.from('stages').select('*').order('order', { ascending: true });
    if (error) throw error;
    
    // Map database objects to application objects
    const stages: Stage[] = (data || []).map(mapDbStageToStage);
    
    // Collect opportunities for each stage
    for (const stage of stages) {
      stage.opportunities = await opportunityAPI.getByStageId(stage.id);
    }
    
    return stages;
  },

  getByFunnelId: async (funnelId: string): Promise<Stage[]> => {
    const { data, error } = await supabase.from('stages').select('*').eq('funnel_id', funnelId).order('order', { ascending: true });
    if (error) throw error;
    
    // Map database objects to application objects
    const stages: Stage[] = (data || []).map(mapDbStageToStage);
    
    // Collect opportunities for each stage
    for (const stage of stages) {
      stage.opportunities = await opportunityAPI.getByStageId(stage.id);
    }
    
    return stages;
  },

  getById: async (id: string): Promise<Stage | null> => {
    const { data, error } = await supabase.from('stages').select('*').eq('id', id).single();
    if (error || !data) return null;
    
    const stage = mapDbStageToStage(data);
    stage.opportunities = await opportunityAPI.getByStageId(id);
    
    return stage;
  },

  create: async (data: StageFormData): Promise<Stage> => {
    const { data: created, error } = await supabase.from('stages').insert([
      { 
        name: data.name, 
        description: data.description, 
        funnel_id: data.funnelId 
      }
    ]).select().single();
    
    if (error || !created) throw error || new Error('Stage create error');
    
    const stage = mapDbStageToStage(created);
    stage.opportunities = [];
    
    await triggerEntityWebhooks('stage', created.id, 'create', created);
    return stage;
  },

  update: async (id: string, data: Partial<StageFormData>): Promise<Stage | null> => {
    // Convert camelCase to snake_case for the database
    const dbData: any = { ...data };
    if (data.funnelId !== undefined) {
      dbData.funnel_id = data.funnelId;
      delete dbData.funnelId;
    }
    
    const { data: updated, error } = await supabase.from('stages').update(dbData).eq('id', id).select().single();
    if (error || !updated) return null;
    
    await triggerEntityWebhooks('stage', id, 'update', updated);
    
    const stage = mapDbStageToStage(updated);
    stage.opportunities = await opportunityAPI.getByStageId(id);
    
    return stage;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('stages').delete().eq('id', id);
    return !error;
  }
};

// --- OPPORTUNITY API ---
export const opportunityAPI = {
  getAll: async (): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    // Map database objects to application objects
    const opportunities: Opportunity[] = (data || []).map(mapDbOpportunityToOpportunity);
    
    // Add scheduled actions for each opportunity
    for (const opportunity of opportunities) {
      opportunity.scheduledActions = await scheduledActionAPI.getByOpportunityId(opportunity.id);
    }
    
    return opportunities;
  },

  getByStageId: async (stageId: string): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('stage_id', stageId).order('created_at', { ascending: false });
    if (error) throw error;
    
    // Map database objects to application objects
    const opportunities: Opportunity[] = (data || []).map(mapDbOpportunityToOpportunity);
    
    // Add scheduled actions for each opportunity
    for (const opportunity of opportunities) {
      opportunity.scheduledActions = await scheduledActionAPI.getByOpportunityId(opportunity.id);
    }
    
    return opportunities;
  },

  getByFunnelId: async (funnelId: string): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('funnel_id', funnelId).order('created_at', { ascending: false });
    if (error) throw error;
    
    // Map database objects to application objects
    const opportunities: Opportunity[] = (data || []).map(mapDbOpportunityToOpportunity);
    
    // Add scheduled actions for each opportunity
    for (const opportunity of opportunities) {
      opportunity.scheduledActions = await scheduledActionAPI.getByOpportunityId(opportunity.id);
    }
    
    return opportunities;
  },

  getById: async (id: string): Promise<Opportunity | null> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
    if (error || !data) return null;
    
    const opportunity = mapDbOpportunityToOpportunity(data);
    opportunity.scheduledActions = await scheduledActionAPI.getByOpportunityId(id);
    
    return opportunity;
  },

  create: async (data: OpportunityFormData): Promise<Opportunity> => {
    const { data: created, error } = await supabase.from('opportunities').insert([
      {
        title: data.title,
        value: data.value,
        client: data.client,
        stage_id: data.stageId,
        funnel_id: data.funnelId,
      }
    ]).select().single();
    
    if (error || !created) throw error || new Error("Opportunity create error");
    
    const opportunity = mapDbOpportunityToOpportunity(created);
    opportunity.scheduledActions = [];
    
    await triggerEntityWebhooks('opportunity', created.id, 'create', created);
    return opportunity;
  },

  update: async (id: string, data: Partial<OpportunityFormData>): Promise<Opportunity | null> => {
    // Convert camelCase to snake_case for the database
    const dbData: any = { ...data };
    if (data.stageId !== undefined) {
      dbData.stage_id = data.stageId;
      delete dbData.stageId;
    }
    if (data.funnelId !== undefined) {
      dbData.funnel_id = data.funnelId;
      delete dbData.funnelId;
    }
    
    const { data: updated, error } = await supabase.from('opportunities').update(dbData).eq('id', id).select().single();
    if (error || !updated) return null;
    
    await triggerEntityWebhooks(
      'opportunity',
      id,
      data.stageId ? 'move' : 'update',
      updated
    );
    
    const opportunity = mapDbOpportunityToOpportunity(updated);
    opportunity.scheduledActions = await scheduledActionAPI.getByOpportunityId(id);
    
    return opportunity;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('opportunities').delete().eq('id', id);
    return !error;
  },

  // Move opportunity between stages
  move: async (id: string, newStageId: string): Promise<Opportunity | null> => {
    // Fetch the existing opportunity
    const { data: existing, error: fetchErr } = await supabase.from('opportunities').select('*').eq('id', id).single();
    if (fetchErr || !existing) return null;
    
    const { data: updated, error } = await supabase.from('opportunities').update({ stage_id: newStageId }).eq('id', id).select().single();
    if (error || !updated) return null;
    
    await triggerEntityWebhooks('opportunity', id, 'move', updated);
    
    const opportunity = mapDbOpportunityToOpportunity(updated);
    opportunity.scheduledActions = await scheduledActionAPI.getByOpportunityId(id);
    
    return opportunity;
  }
};

// --- WEBHOOK API ---
export const webhookAPI = {
  getAll: async (): Promise<WebhookConfig[]> => {
    const { data, error } = await supabase.from('webhooks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbWebhookToWebhook);
  },

  getById: async (id: string): Promise<WebhookConfig | null> => {
    const { data, error } = await supabase.from('webhooks').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapDbWebhookToWebhook(data);
  },

  getByTarget: async (targetType: 'funnel' | 'stage' | 'opportunity', targetId: string): Promise<WebhookConfig[]> => {
    const { data, error } = await supabase.from('webhooks').select('*').eq('target_type', targetType).eq('target_id', targetId);
    if (error) throw error;
    return (data || []).map(mapDbWebhookToWebhook);
  },

  create: async (data: WebhookFormData): Promise<WebhookConfig> => {
    const { data: created, error } = await supabase.from('webhooks').insert([
      {
        target_type: data.targetType,
        target_id: data.targetId,
        url: data.url,
        event: data.event
      }
    ]).select().single();
    
    if (error || !created) throw error || new Error("Webhook create error");
    return mapDbWebhookToWebhook(created);
  },

  update: async (id: string, data: Partial<WebhookFormData>): Promise<WebhookConfig | null> => {
    // Convert camelCase to snake_case for the database
    const dbData: any = { ...data };
    if (data.targetType !== undefined) {
      dbData.target_type = data.targetType;
      delete dbData.targetType;
    }
    if (data.targetId !== undefined) {
      dbData.target_id = data.targetId;
      delete dbData.targetId;
    }
    
    const { data: updated, error } = await supabase.from('webhooks').update(dbData).eq('id', id).select().single();
    if (error || !updated) return null;
    return mapDbWebhookToWebhook(updated);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('webhooks').delete().eq('id', id);
    return !error;
  },

  // Inbound webhook handler simulation (not implemented)
  receiveInbound: async (payload: any): Promise<Opportunity | null> => {
    // Not used, can implement later with Edge Function if needed
    return null;
  }
};

// --- SCHEDULED ACTIONS API ---
export const scheduledActionAPI = {
  getAll: async (): Promise<ScheduledAction[]> => {
    const { data, error } = await supabase.from('scheduled_actions').select('*').order('scheduled_datetime', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbScheduledActionToScheduledAction);
  },

  getByOpportunityId: async (opportunityId: string): Promise<ScheduledAction[]> => {
    const { data, error } = await supabase.from('scheduled_actions').select('*').eq('opportunity_id', opportunityId).order('scheduled_datetime', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbScheduledActionToScheduledAction);
  },

  getById: async (id: string): Promise<ScheduledAction | null> => {
    const { data, error } = await supabase.from('scheduled_actions').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapDbScheduledActionToScheduledAction(data);
  },

  create: async (data: ScheduledActionFormData): Promise<ScheduledAction> => {
    // Format the date as ISO string for Supabase
    const scheduledDateTime = data.scheduledDateTime instanceof Date 
      ? data.scheduledDateTime.toISOString() 
      : new Date(data.scheduledDateTime).toISOString();
      
    const { data: created, error } = await supabase.from('scheduled_actions').insert({
      opportunity_id: data.opportunityId,
      action_type: data.actionType,
      action_config: data.actionConfig as any,
      scheduled_datetime: scheduledDateTime,
      status: 'pending'
    }).select().single();
    
    if (error || !created) throw error || new Error("Scheduled action create error");
    return mapDbScheduledActionToScheduledAction(created);
  },

  update: async (id: string, data: Partial<ScheduledActionFormData>): Promise<ScheduledAction | null> => {
    // Convert camelCase to snake_case for the database
    const dbData: any = {};
    
    if (data.opportunityId !== undefined) {
      dbData.opportunity_id = data.opportunityId;
    }
    if (data.actionType !== undefined) {
      dbData.action_type = data.actionType;
    }
    if (data.actionConfig !== undefined) {
      dbData.action_config = data.actionConfig as any;
    }
    if (data.scheduledDateTime !== undefined) {
      dbData.scheduled_datetime = data.scheduledDateTime instanceof Date 
        ? data.scheduledDateTime.toISOString() 
        : new Date(data.scheduledDateTime).toISOString();
    }
    
    const { data: updated, error: updateErr } = await supabase.from('scheduled_actions').update(dbData).eq('id', id).select().single();
    if (updateErr || !updated) return null;
    return mapDbScheduledActionToScheduledAction(updated);
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('scheduled_actions').delete().eq('id', id);
    return !error;
  },

  execute: async (id: string): Promise<boolean> => {
    // For now, just mark as completed
    const { error } = await supabase.from('scheduled_actions').update({ status: 'completed' }).eq('id', id);
    // TODO: Optionally trigger some side effect here (send webhook, send email, etc)
    return !error;
  }
};

// Removed duplicate declarations of dispatchWebhook and triggerEntityWebhooks
