
import { supabase } from "@/integrations/supabase/client";
import { WebhookConfig, WebhookFormData, WebhookPayload } from "@/types";
import { mapDbWebhookToWebhook } from "./utils/mappers";

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
    const { data: created, error } = await supabase.from('webhooks').insert([{
      target_type: data.targetType,
      target_id: data.targetId,
      url: data.url,
      event: data.event
    }]).select().single();
    
    if (error || !created) throw error || new Error("Webhook create error");
    return mapDbWebhookToWebhook(created);
  },

  update: async (id: string, data: Partial<WebhookFormData>): Promise<WebhookConfig | null> => {
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

  receiveInbound: async (payload: any): Promise<Opportunity | null> => {
    // Not used, can implement later with Edge Function if needed
    return null;
  }
};
