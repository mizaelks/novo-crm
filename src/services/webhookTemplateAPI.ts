
import { supabase } from "@/integrations/supabase/client";
import { WebhookTemplate, WebhookTemplateFormData } from "@/types";

// Define the explicit type for the response from the RPC functions
type WebhookTemplateResponse = {
  id: string;
  name: string;
  description: string | null;
  url: string;
  target_type: string;
  event: string;
  payload: string;
  created_at: string;
};

export const webhookTemplateAPI = {
  getAll: async (): Promise<WebhookTemplate[]> => {
    // Using RPC function to get webhook templates with explicit type casting
    const { data, error } = await supabase
      .rpc('get_webhook_templates') as unknown as { 
        data: WebhookTemplateResponse[], 
        error: Error | null 
      };
    
    if (error) throw error;
    
    const templates = data || [];
    
    return templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description || '',
      url: template.url,
      targetType: template.target_type as 'funnel' | 'stage' | 'opportunity',
      event: template.event as 'create' | 'update' | 'move',
      payload: template.payload,
      createdAt: new Date(template.created_at)
    }));
  },

  getById: async (id: string): Promise<WebhookTemplate | null> => {
    // Using RPC function to get webhook template by ID with explicit type casting
    const { data, error } = await supabase
      .rpc('get_webhook_template_by_id', { template_id: id }) as unknown as { 
        data: WebhookTemplateResponse, 
        error: Error | null 
      };
    
    if (error || !data) return null;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      url: data.url,
      targetType: data.target_type as 'funnel' | 'stage' | 'opportunity',
      event: data.event as 'create' | 'update' | 'move',
      payload: data.payload,
      createdAt: new Date(data.created_at)
    };
  },

  create: async (data: WebhookTemplateFormData): Promise<WebhookTemplate> => {
    // Using RPC function to create webhook template with explicit type casting
    const { data: created, error } = await supabase
      .rpc('create_webhook_template', {
        p_name: data.name,
        p_description: data.description || '',
        p_url: data.url,
        p_target_type: data.targetType,
        p_event: data.event,
        p_payload: data.payload
      }) as unknown as { 
        data: WebhookTemplateResponse, 
        error: Error | null 
      };
    
    if (error || !created) throw error || new Error("Webhook template create error");
    
    return {
      id: created.id,
      name: created.name,
      description: created.description || '',
      url: created.url,
      targetType: created.target_type as 'funnel' | 'stage' | 'opportunity',
      event: created.event as 'create' | 'update' | 'move',
      payload: created.payload,
      createdAt: new Date(created.created_at)
    };
  },

  update: async (id: string, data: Partial<WebhookTemplateFormData>): Promise<WebhookTemplate | null> => {
    // Using RPC function to update webhook template with explicit type casting
    const { data: updated, error } = await supabase
      .rpc('update_webhook_template', {
        p_id: id,
        p_name: data.name || null,
        p_description: data.description || null,
        p_url: data.url || null,
        p_target_type: data.targetType || null,
        p_event: data.event || null,
        p_payload: data.payload || null
      }) as unknown as { 
        data: WebhookTemplateResponse, 
        error: Error | null 
      };
    
    if (error || !updated) return null;
    
    return {
      id: updated.id,
      name: updated.name,
      description: updated.description || '',
      url: updated.url,
      targetType: updated.target_type as 'funnel' | 'stage' | 'opportunity',
      event: updated.event as 'create' | 'update' | 'move',
      payload: updated.payload,
      createdAt: new Date(updated.created_at)
    };
  },

  delete: async (id: string): Promise<boolean> => {
    // Using RPC function to delete webhook template with explicit type casting
    const { error } = await supabase
      .rpc('delete_webhook_template', { template_id: id }) as unknown as { 
        data: null, 
        error: Error | null 
      };
    
    return !error;
  }
};
