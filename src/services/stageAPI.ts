import { supabase } from "@/integrations/supabase/client";
import { Stage, StageFormData, RequiredField } from "@/types";
import { mapDbStageToStage } from "./utils/mappers";
import { opportunityAPI } from "./opportunityAPI";
import { triggerEntityWebhooks } from "./utils/webhook";

// Valid field types for RequiredField
type ValidFieldType = "text" | "number" | "date" | "checkbox" | "select";

// Helper to ensure type is one of the valid field types
const validateFieldType = (type: string): ValidFieldType => {
  const validTypes: ValidFieldType[] = ["text", "number", "date", "checkbox", "select"];
  if (validTypes.includes(type as ValidFieldType)) {
    return type as ValidFieldType;
  }
  // Default to text if invalid type
  console.warn(`Invalid field type: ${type}, defaulting to "text"`);
  return "text";
};

export const stageAPI = {
  getAll: async (): Promise<Stage[]> => {
    const { data, error } = await supabase.from('stages').select('*').order('order', { ascending: true });
    if (error) throw error;
    
    const stageBases = (data || []).map(mapDbStageToStage);
    const stages: Stage[] = [];
    
    for (const stageBase of stageBases) {
      const opportunities = await opportunityAPI.getByStageId(stageBase.id);
      // Fetch required fields for this stage
      const requiredFields = await stageAPI.getRequiredFieldsByStageId(stageBase.id);
      stages.push({
        ...stageBase,
        opportunities,
        requiredFields
      });
    }
    
    return stages;
  },

  getByFunnelId: async (funnelId: string): Promise<Stage[]> => {
    const { data, error } = await supabase.from('stages').select('*').eq('funnel_id', funnelId).order('order', { ascending: true });
    if (error) throw error;
    
    const stageBases = (data || []).map(mapDbStageToStage);
    const stages: Stage[] = [];
    
    for (const stageBase of stageBases) {
      const opportunities = await opportunityAPI.getByStageId(stageBase.id);
      // Fetch required fields for this stage
      const requiredFields = await stageAPI.getRequiredFieldsByStageId(stageBase.id);
      stages.push({
        ...stageBase,
        opportunities,
        requiredFields
      });
    }
    
    return stages;
  },

  getById: async (id: string): Promise<Stage | null> => {
    const { data, error } = await supabase.from('stages').select('*').eq('id', id).single();
    if (error || !data) return null;
    
    const stageBase = mapDbStageToStage(data);
    const opportunities = await opportunityAPI.getByStageId(id);
    // Fetch required fields for this stage
    const requiredFields = await stageAPI.getRequiredFieldsByStageId(id);
    
    return {
      ...stageBase,
      opportunities,
      requiredFields
    };
  },

  getRequiredFieldsByStageId: async (stageId: string): Promise<RequiredField[]> => {
    const { data, error } = await supabase
      .from('required_fields')
      .select('*')
      .eq('stage_id', stageId);
      
    if (error) {
      console.error("Error fetching required fields:", error);
      return [];
    }
    
    return (data || []).map(field => ({
      id: field.id,
      name: field.name,
      type: validateFieldType(field.type),
      options: field.options,
      isRequired: field.is_required,
      stageId: field.stage_id
    }));
  },

  create: async (data: StageFormData): Promise<Stage> => {
    console.log("Criando etapa com os dados:", data);
    
    const { data: created, error } = await supabase.from('stages').insert([{ 
      name: data.name, 
      description: data.description, 
      funnel_id: data.funnelId,
      color: data.color || '#CCCCCC',
      is_win_stage: data.isWinStage || false,
      is_loss_stage: data.isLossStage || false
    }]).select().single();
    
    if (error || !created) {
      console.error("Erro ao criar etapa:", error);
      throw error || new Error('Stage create error');
    }
    
    const stageBase = mapDbStageToStage(created);
    
    // Create required fields if any
    const requiredFields: RequiredField[] = [];
    if (data.requiredFields && data.requiredFields.length > 0) {
      for (const field of data.requiredFields) {
        const addedField = await stageAPI.addRequiredField({
          name: field.name,
          type: field.type,
          options: field.options,
          isRequired: field.isRequired,
          stageId: created.id
        });
        
        if (addedField) {
          requiredFields.push(addedField);
        }
      }
    }
    
    await triggerEntityWebhooks('stage', created.id, 'create', created);
    
    return {
      ...stageBase,
      opportunities: [],
      requiredFields
    };
  },

  update: async (id: string, data: Partial<StageFormData>): Promise<Stage | null> => {
    console.log("Atualizando etapa:", id, "com dados:", data);
    const dbData: any = {};
    
    if (data.name !== undefined) dbData.name = data.name;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.color !== undefined) dbData.color = data.color;
    if (data.isWinStage !== undefined) dbData.is_win_stage = data.isWinStage;
    if (data.isLossStage !== undefined) dbData.is_loss_stage = data.isLossStage;
    
    if (data.funnelId !== undefined) {
      dbData.funnel_id = data.funnelId;
    }
    
    const { data: updated, error } = await supabase.from('stages').update(dbData).eq('id', id).select().single();
    
    if (error) {
      console.error("Erro ao atualizar etapa:", error);
      return null;
    }
    
    if (!updated) {
      console.error("Não foi possível atualizar a etapa. Nenhum dado retornado.");
      return null;
    }
    
    // Update required fields if provided
    if (data.requiredFields) {
      // First, delete all existing required fields for this stage
      await supabase.from('required_fields').delete().eq('stage_id', id);
      
      // Then add the new ones
      for (const field of data.requiredFields) {
        await stageAPI.addRequiredField({
          name: field.name,
          type: field.type,
          options: field.options,
          isRequired: field.isRequired,
          stageId: id
        });
      }
    }
    
    await triggerEntityWebhooks('stage', id, 'update', updated);
    
    const stageBase = mapDbStageToStage(updated);
    const opportunities = await opportunityAPI.getByStageId(id);
    const requiredFields = data.requiredFields || await stageAPI.getRequiredFieldsByStageId(id);
    
    return {
      ...stageBase,
      opportunities,
      requiredFields
    };
  },

  // Add a required field to a stage
  addRequiredField: async (fieldData: {
    name: string;
    type: "text" | "number" | "date" | "checkbox" | "select";
    options?: string[];
    isRequired: boolean;
    stageId: string;
  }): Promise<RequiredField | null> => {
    const { data, error } = await supabase.from('required_fields').insert([{
      name: fieldData.name,
      type: fieldData.type,
      options: fieldData.options,
      is_required: fieldData.isRequired,
      stage_id: fieldData.stageId
    }]).select().single();
    
    if (error || !data) {
      console.error("Error adding required field:", error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      type: validateFieldType(data.type),
      options: data.options,
      isRequired: data.is_required,
      stageId: data.stage_id
    };
  },

  delete: async (id: string): Promise<boolean> => {
    // First delete all required fields for this stage
    await supabase.from('required_fields').delete().eq('stage_id', id);
    
    // Then delete the stage
    const { error } = await supabase.from('stages').delete().eq('id', id);
    return !error;
  }
};
