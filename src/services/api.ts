
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

// Utility function to generate IDs is not needed since Supabase autogenerates UUIDs

// API delay mock removed

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
    // For each funnel, fetch its stages & opportunities
    const results: Funnel[] = [];
    for (const funnel of data!) {
      const stages = await stageAPI.getByFunnelId(funnel.id);
      results.push({
        ...funnel,
        stages,
      });
    }
    return results;
  },

  getById: async (id: string): Promise<Funnel | null> => {
    const { data, error } = await supabase.from('funnels').select('*').eq('id', id).single();
    if (error || !data) return null;
    const stages = await stageAPI.getByFunnelId(data.id);
    return {
      ...data,
      stages,
    };
  },

  create: async (data: FunnelFormData): Promise<Funnel> => {
    const { data: created, error } = await supabase.from('funnels').insert([
      { name: data.name, description: data.description }
    ]).select().single();
    if (error || !created) throw error || new Error("Funnel create error");
    // No stages yet
    await triggerEntityWebhooks('funnel', created.id, 'create', created);
    return { ...created, stages: [] };
  },

  update: async (id: string, data: Partial<FunnelFormData>): Promise<Funnel | null> => {
    const { data: updated, error } = await supabase.from('funnels').update(data).eq('id', id).select().single();
    if (error || !updated) return null;
    await triggerEntityWebhooks('funnel', id, 'update', updated);
    const stages = await stageAPI.getByFunnelId(id);
    return { ...updated, stages };
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
    // Collect opportunities for each stage
    const stagesWithOpportunities = await Promise.all(
      (data ?? []).map(async stage => {
        const opportunities = await opportunityAPI.getByStageId(stage.id);
        return { ...stage, opportunities };
      })
    );
    return stagesWithOpportunities;
  },

  getByFunnelId: async (funnelId: string): Promise<Stage[]> => {
    const { data, error } = await supabase.from('stages').select('*').eq('funnel_id', funnelId).order('order', { ascending: true });
    if (error) throw error;
    const stagesWithOpportunities = await Promise.all(
      (data ?? []).map(async stage => {
        const opportunities = await opportunityAPI.getByStageId(stage.id);
        return { ...stage, opportunities };
      })
    );
    return stagesWithOpportunities;
  },

  getById: async (id: string): Promise<Stage | null> => {
    const { data, error } = await supabase.from('stages').select('*').eq('id', id).single();
    if (error || !data) return null;
    const opportunities = await opportunityAPI.getByStageId(id);
    return { ...data, opportunities };
  },

  create: async (data: StageFormData): Promise<Stage> => {
    const { data: created, error } = await supabase.from('stages').insert([
      { name: data.name, description: data.description, funnel_id: data.funnelId }
    ]).select().single();
    if (error || !created) throw error || new Error('Stage create error');
    const opportunities: Opportunity[] = [];
    await triggerEntityWebhooks('stage', created.id, 'create', created);
    return { ...created, opportunities };
  },

  update: async (id: string, data: Partial<StageFormData>): Promise<Stage | null> => {
    const { data: updated, error } = await supabase.from('stages').update(data).eq('id', id).select().single();
    if (error || !updated) return null;
    await triggerEntityWebhooks('stage', id, 'update', updated);
    const opportunities = await opportunityAPI.getByStageId(id);
    return { ...updated, opportunities };
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
    // Add scheduled actions for each
    return await Promise.all((data ?? []).map(async (opportunity) => {
      const scheduledActions = await scheduledActionAPI.getByOpportunityId(opportunity.id);
      return { ...opportunity, scheduledActions };
    }));
  },

  getByStageId: async (stageId: string): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('stage_id', stageId).order('created_at', { ascending: false });
    if (error) throw error;
    return await Promise.all((data ?? []).map(async opportunity => {
      const scheduledActions = await scheduledActionAPI.getByOpportunityId(opportunity.id);
      return { ...opportunity, scheduledActions };
    }));
  },

  getByFunnelId: async (funnelId: string): Promise<Opportunity[]> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('funnel_id', funnelId).order('created_at', { ascending: false });
    if (error) throw error;
    return await Promise.all((data ?? []).map(async opportunity => {
      const scheduledActions = await scheduledActionAPI.getByOpportunityId(opportunity.id);
      return { ...opportunity, scheduledActions };
    }));
  },

  getById: async (id: string): Promise<Opportunity | null> => {
    const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
    if (error || !data) return null;
    const scheduledActions = await scheduledActionAPI.getByOpportunityId(id);
    return { ...data, scheduledActions };
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
    await triggerEntityWebhooks('opportunity', created.id, 'create', created);
    const scheduledActions: ScheduledAction[] = [];
    return { ...created, scheduledActions };
  },

  update: async (id: string, data: Partial<OpportunityFormData>): Promise<Opportunity | null> => {
    const { data: updated, error } = await supabase.from('opportunities').update(data).eq('id', id).select().single();
    if (error || !updated) return null;
    await triggerEntityWebhooks(
      'opportunity',
      id,
      data.stageId ? 'move' : 'update',
      updated
    );
    const scheduledActions = await scheduledActionAPI.getByOpportunityId(id);
    return { ...updated, scheduledActions };
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
    const scheduledActions = await scheduledActionAPI.getByOpportunityId(id);
    return { ...updated, scheduledActions };
  }
};

// --- WEBHOOK API ---
export const webhookAPI = {
  getAll: async (): Promise<WebhookConfig[]> => {
    const { data, error } = await supabase.from('webhooks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  getById: async (id: string): Promise<WebhookConfig | null> => {
    const { data, error } = await supabase.from('webhooks').select('*').eq('id', id).single();
    if (error || !data) return null;
    return data;
  },

  getByTarget: async (targetType: 'funnel' | 'stage' | 'opportunity', targetId: string): Promise<WebhookConfig[]> => {
    const { data, error } = await supabase.from('webhooks').select('*').eq('target_type', targetType).eq('target_id', targetId);
    if (error) throw error;
    return data ?? [];
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
    return created;
  },

  update: async (id: string, data: Partial<WebhookFormData>): Promise<WebhookConfig | null> => {
    const { data: updated, error } = await supabase.from('webhooks').update(data).eq('id', id).select().single();
    if (error || !updated) return null;
    return updated;
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
    return data ?? [];
  },

  getByOpportunityId: async (opportunityId: string): Promise<ScheduledAction[]> => {
    const { data, error } = await supabase.from('scheduled_actions').select('*').eq('opportunity_id', opportunityId).order('scheduled_datetime', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  getById: async (id: string): Promise<ScheduledAction | null> => {
    const { data, error } = await supabase.from('scheduled_actions').select('*').eq('id', id).single();
    if (error || !data) return null;
    return data;
  },

  create: async (data: ScheduledActionFormData): Promise<ScheduledAction> => {
    const { data: created, error } = await supabase.from('scheduled_actions').insert([
      {
        opportunity_id: data.opportunityId,
        action_type: data.actionType,
        action_config: data.actionConfig,
        scheduled_datetime: data.scheduledDateTime,
        status: 'pending'
      }
    ]).select().single();
    if (error || !created) throw error || new Error("Scheduled action create error");
    return created;
  },

  update: async (id: string, data: Partial<ScheduledActionFormData>): Promise<ScheduledAction | null> => {
    // Ensure to deep merge actionConfig if partial
    let updateObj: any = { ...data };
    if (data.actionConfig) {
      const { data: existing, error } = await supabase.from('scheduled_actions').select('action_config').eq('id', id).single();
      if (error) return null;
      updateObj.action_config = { ...existing.action_config, ...data.actionConfig };
    }
    const { data: updated, error: updateErr } = await supabase.from('scheduled_actions').update(updateObj).eq('id', id).select().single();
    if (updateErr || !updated) return null;
    return updated;
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
