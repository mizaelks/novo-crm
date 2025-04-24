
import { supabase } from "@/integrations/supabase/client";
import { WebhookTemplate, WebhookTemplateFormData } from "@/types";

export const webhookTemplateAPI = {
  getAll: async (): Promise<WebhookTemplate[]> => {
    const { data, error } = await supabase
      .from('webhook_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(template => ({
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
    const { data, error } = await supabase
      .from('webhook_templates')
      .select('*')
      .eq('id', id)
      .single();
    
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
    const { data: created, error } = await supabase
      .from('webhook_templates')
      .insert({
        name: data.name,
        description: data.description,
        url: data.url,
        target_type: data.targetType,
        event: data.event,
        payload: data.payload
      })
      .select()
      .single();
    
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
    const dbData: any = {};
    
    if (data.name !== undefined) dbData.name = data.name;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.url !== undefined) dbData.url = data.url;
    if (data.targetType !== undefined) dbData.target_type = data.targetType;
    if (data.event !== undefined) dbData.event = data.event;
    if (data.payload !== undefined) dbData.payload = data.payload;
    
    const { data: updated, error } = await supabase
      .from('webhook_templates')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();
    
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
    const { error } = await supabase
      .from('webhook_templates')
      .delete()
      .eq('id', id);
    
    return !error;
  }
};
