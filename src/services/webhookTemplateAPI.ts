
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
    // Using RPC function to get webhook templates
    const { data, error } = await supabase
      .rpc('get_webhook_templates');
    
    if (error) throw error;
    
    const templates = data as WebhookTemplateResponse[] || [];
    
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
    // Using RPC function to get webhook template by ID
    const { data, error } = await supabase
      .rpc('get_webhook_template_by_id', { template_id: id });
    
    if (error || !data) return null;
    
    const template = data as WebhookTemplateResponse;
    
    return {
      id: template.id,
      name: template.name,
      description: template.description || '',
      url: template.url,
      targetType: template.target_type as 'funnel' | 'stage' | 'opportunity',
      event: template.event as 'create' | 'update' | 'move',
      payload: template.payload,
      createdAt: new Date(template.created_at)
    };
  },

  create: async (data: WebhookTemplateFormData): Promise<WebhookTemplate> => {
    // Using RPC function to create webhook template
    const { data: created, error } = await supabase
      .rpc('create_webhook_template', {
        p_name: data.name,
        p_description: data.description || '',
        p_url: data.url,
        p_target_type: data.targetType,
        p_event: data.event,
        p_payload: data.payload
      });
    
    if (error || !created) throw error || new Error("Webhook template create error");
    
    const template = created as WebhookTemplateResponse;
    
    return {
      id: template.id,
      name: template.name,
      description: template.description || '',
      url: template.url,
      targetType: template.target_type as 'funnel' | 'stage' | 'opportunity',
      event: template.event as 'create' | 'update' | 'move',
      payload: template.payload,
      createdAt: new Date(template.created_at)
    };
  },

  update: async (id: string, data: Partial<WebhookTemplateFormData>): Promise<WebhookTemplate | null> => {
    // Using RPC function to update webhook template
    const { data: updated, error } = await supabase
      .rpc('update_webhook_template', {
        p_id: id,
        p_name: data.name || null,
        p_description: data.description || null,
        p_url: data.url || null,
        p_target_type: data.targetType || null,
        p_event: data.event || null,
        p_payload: data.payload || null
      });
    
    if (error || !updated) return null;
    
    const template = updated as WebhookTemplateResponse;
    
    return {
      id: template.id,
      name: template.name,
      description: template.description || '',
      url: template.url,
      targetType: template.target_type as 'funnel' | 'stage' | 'opportunity',
      event: template.event as 'create' | 'update' | 'move',
      payload: template.payload,
      createdAt: new Date(template.created_at)
    };
  },

  delete: async (id: string): Promise<boolean> => {
    // Using RPC function to delete webhook template
    const { error } = await supabase
      .rpc('delete_webhook_template', { template_id: id });
    
    return !error;
  }
};
