
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
    // Fix: Use two separate queries and combine results instead of using OR with a wildcard
    // First query: Get webhooks for this specific target ID
    const { data: specificWebhooks, error: specificError } = await supabase.from('webhooks')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', targetId);
    
    if (specificError) {
      console.error("Error fetching specific webhooks:", specificError);
      throw specificError;
    }
    
    // Second query: Get wildcard webhooks (target_id = '*')
    const { data: wildcardWebhooks, error: wildcardError } = await supabase.from('webhooks')
      .select('*')
      .eq('target_type', targetType)
      .eq('target_id', '*');
    
    if (wildcardError) {
      console.error("Error fetching wildcard webhooks:", wildcardError);
      throw wildcardError;
    }
    
    // Combine both results
    const combinedWebhooks = [...(specificWebhooks || []), ...(wildcardWebhooks || [])];
    return combinedWebhooks.map(mapDbWebhookToWebhook);
  },

  create: async (data: WebhookFormData): Promise<WebhookConfig> => {
    console.log("Creating webhook with data:", data);
    
    const { data: created, error } = await supabase.from('webhooks').insert([{
      target_type: data.targetType,
      target_id: data.targetId,
      url: data.url,
      event: data.event
    }]).select().single();
    
    if (error || !created) {
      console.error("Webhook creation error:", error);
      throw error || new Error("Webhook create error");
    }
    
    console.log("Webhook created successfully:", created);
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

  receiveInbound: async (payload: any): Promise<any | null> => {
    console.log("Processing inbound webhook payload:", payload);
    
    try {
      // Validate required fields
      if (!payload.title || !payload.stageId || !payload.funnelId) {
        console.error("Invalid payload - missing required fields");
        return null;
      }
      
      // Create object with all possible fields from payload
      const opportunityData = {
        title: payload.title,
        client: payload.client || 'External client',
        value: payload.value || 0,
        stage_id: payload.stageId,
        funnel_id: payload.funnelId,
        // Additional contact information fields
        phone: payload.phone || null,
        email: payload.email || null,
        company: payload.company || null,
      };
      
      const { data, error } = await supabase.from('opportunities')
        .insert([opportunityData])
        .select()
        .single();
      
      if (error) {
        console.error("Database error when processing webhook:", error);
        throw error;
      }
      
      console.log("Created opportunity from webhook:", data);
      return data;
    } catch (error) {
      console.error("Failed to process inbound webhook:", error);
      return null;
    }
  }
};
