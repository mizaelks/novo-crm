
import { supabase } from "@/integrations/supabase/client";
import { Funnel, FunnelFormData } from "@/types";
import { mapDbFunnelToFunnel } from "./utils/mappers";
import { stageAPI } from "./stageAPI";
import { triggerEntityWebhooks } from "./utils/webhook";

export const funnelAPI = {
  getAll: async (): Promise<Funnel[]> => {
    const { data, error } = await supabase.from('funnels').select('*').order('order', { ascending: true });
    if (error) throw error;
    
    const funnelBases = (data || []).map(mapDbFunnelToFunnel);
    const funnels: Funnel[] = [];
    
    for (const funnelBase of funnelBases) {
      const stages = await stageAPI.getByFunnelId(funnelBase.id);
      funnels.push({
        ...funnelBase,
        stages
      });
    }
    
    return funnels;
  },

  getById: async (id: string): Promise<Funnel | null> => {
    const { data, error } = await supabase.from('funnels').select('*').eq('id', id).single();
    if (error || !data) return null;
    
    const funnelBase = mapDbFunnelToFunnel(data);
    const stages = await stageAPI.getByFunnelId(data.id);
    
    return {
      ...funnelBase,
      stages
    };
  },

  create: async (data: FunnelFormData): Promise<Funnel> => {
    const { data: created, error } = await supabase.from('funnels').insert([
      { 
        name: data.name, 
        description: data.description,
        funnel_type: data.funnelType || 'venda'
      }
    ]).select().single();
    
    if (error || !created) throw error || new Error("Funnel create error");
    
    const funnelBase = mapDbFunnelToFunnel(created);
    
    await triggerEntityWebhooks('funnel', created.id, 'create', created);
    
    return {
      ...funnelBase,
      stages: []
    };
  },

  update: async (id: string, data: Partial<FunnelFormData>): Promise<Funnel | null> => {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.funnelType !== undefined) updateData.funnel_type = data.funnelType;

    const { data: updated, error } = await supabase.from('funnels').update(updateData).eq('id', id).select().single();
    if (error || !updated) return null;
    
    await triggerEntityWebhooks('funnel', id, 'update', updated);
    
    const funnelBase = mapDbFunnelToFunnel(updated);
    const stages = await stageAPI.getByFunnelId(id);
    
    return {
      ...funnelBase,
      stages
    };
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('funnels').delete().eq('id', id);
    return !error;
  }
};
