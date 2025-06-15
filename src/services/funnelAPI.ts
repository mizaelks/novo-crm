
import { supabase } from "@/integrations/supabase/client";
import { Funnel, FunnelFormData } from "@/types";
import { mapDbFunnelToFunnel } from "./utils/mappers";
import { stageAPI } from "./stageAPI";
import { opportunityAPI } from "./opportunityAPI";
import { triggerEntityWebhooks } from "./utils/webhook";

export const funnelAPI = {
  getAll: async (): Promise<Funnel[]> => {
    try {
      console.log('🔄 funnelAPI.getAll - Starting fetch...');
      
      const { data, error } = await supabase
        .from('funnels')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) {
        console.error('❌ funnelAPI.getAll - Supabase error:', error);
        throw error;
      }
      
      console.log('✅ funnelAPI.getAll - Raw data from Supabase:', data);
      
      if (!Array.isArray(data)) {
        console.error('❌ funnelAPI.getAll - Data is not an array:', data);
        return [];
      }
      
      const funnelBases = data.map(item => {
        try {
          return mapDbFunnelToFunnel(item);
        } catch (mapError) {
          console.error('❌ funnelAPI.getAll - Error mapping funnel:', item, mapError);
          return null;
        }
      }).filter(Boolean) as Funnel[];
      
      console.log('📊 funnelAPI.getAll - Mapped funnel bases:', funnelBases);
      
      const funnels: Funnel[] = [];
      
      for (const funnelBase of funnelBases) {
        try {
          console.log(`🔄 funnelAPI.getAll - Loading stages for funnel ${funnelBase.id}...`);
          const stages = await stageAPI.getByFunnelId(funnelBase.id);
          console.log(`✅ funnelAPI.getAll - Stages loaded for ${funnelBase.id}:`, stages);
          
          // Verificar se stages é válido
          const validStages = Array.isArray(stages) ? stages : [];
          
          // Carregar oportunidades para cada etapa
          const stagesWithOpportunities = await Promise.all(
            validStages.map(async (stage) => {
              try {
                console.log(`🔄 Loading opportunities for stage ${stage.id} (${stage.name})`);
                const opportunities = await opportunityAPI.getByStageId(stage.id, false); // false = exclude archived
                console.log(`✅ Loaded ${opportunities.length} opportunities for stage ${stage.name}`);
                
                return {
                  ...stage,
                  opportunities: Array.isArray(opportunities) ? opportunities : []
                };
              } catch (opportunityError) {
                console.error(`❌ Error loading opportunities for stage ${stage.id}:`, opportunityError);
                return {
                  ...stage,
                  opportunities: []
                };
              }
            })
          );
          
          funnels.push({
            ...funnelBase,
            stages: stagesWithOpportunities
          });
        } catch (stageError) {
          console.error(`❌ funnelAPI.getAll - Error loading stages for funnel ${funnelBase.id}:`, stageError);
          // Adicionar funil mesmo sem stages
          funnels.push({
            ...funnelBase,
            stages: []
          });
        }
      }
      
      console.log('✅ funnelAPI.getAll - Final funnels with stages and opportunities:', funnels);
      return funnels;
    } catch (error) {
      console.error('❌ funnelAPI.getAll - General error:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Funnel | null> => {
    try {
      console.log(`🔄 funnelAPI.getById - Fetching funnel ${id}...`);
      
      const { data, error } = await supabase
        .from('funnels')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        console.error(`❌ funnelAPI.getById - Error or no data for ${id}:`, error);
        return null;
      }
      
      console.log(`✅ funnelAPI.getById - Raw data for ${id}:`, data);
      
      const funnelBase = mapDbFunnelToFunnel(data);
      const stages = await stageAPI.getByFunnelId(data.id);
      
      const result = {
        ...funnelBase,
        stages: Array.isArray(stages) ? stages : []
      };
      
      console.log(`✅ funnelAPI.getById - Final result for ${id}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ funnelAPI.getById - Error for ${id}:`, error);
      return null;
    }
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
