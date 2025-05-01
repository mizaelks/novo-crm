
import { supabase } from "@/integrations/supabase/client";
import { ScheduledAction, ScheduledActionFormData } from "@/types";
import { mapDbScheduledActionToScheduledAction } from "./utils/mappers";
import { Json } from '@/integrations/supabase/types';

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
    const scheduledDateTime = data.scheduledDateTime instanceof Date 
      ? data.scheduledDateTime.toISOString() 
      : new Date(data.scheduledDateTime).toISOString();
      
    // Log detalhado para debug
    console.log("Criando ação agendada:", {
      opportunity_id: data.opportunityId,
      action_type: data.actionType,
      action_config: data.actionConfig,
      scheduled_datetime: scheduledDateTime,
      template_id: data.templateId,
      status: 'pending'
    });
    
    const { data: created, error } = await supabase.from('scheduled_actions').insert({
      opportunity_id: data.opportunityId,
      action_type: data.actionType,
      action_config: data.actionConfig as Json,
      scheduled_datetime: scheduledDateTime,
      template_id: data.templateId,
      status: 'pending'
    }).select().single();
    
    if (error || !created) {
      console.error("Erro ao criar ação agendada:", error);
      throw error || new Error("Scheduled action create error");
    }
    
    console.log("Ação agendada criada com sucesso:", created);
    return mapDbScheduledActionToScheduledAction(created);
  },

  update: async (id: string, data: Partial<ScheduledActionFormData>): Promise<ScheduledAction | null> => {
    const dbData: any = {};
    
    if (data.opportunityId !== undefined) {
      dbData.opportunity_id = data.opportunityId;
    }
    if (data.actionType !== undefined) {
      dbData.action_type = data.actionType;
    }
    if (data.actionConfig !== undefined) {
      dbData.action_config = data.actionConfig as Json;
    }
    if (data.scheduledDateTime !== undefined) {
      dbData.scheduled_datetime = data.scheduledDateTime instanceof Date 
        ? data.scheduledDateTime.toISOString() 
        : new Date(data.scheduledDateTime).toISOString();
    }
    if (data.templateId !== undefined) {
      dbData.template_id = data.templateId;
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
    const { error } = await supabase.from('scheduled_actions').update({ status: 'completed' }).eq('id', id);
    return !error;
  }
};
