
import { supabase } from "@/integrations/supabase/client";
import { Stage, StageFormData, RequiredField, RequiredTask } from "@/types";
import { mapDbStageToStage } from "./utils/mappers";
import { opportunityAPI } from "./opportunityAPI";
import { triggerEntityWebhooks } from "./utils/webhook";

type ValidFieldType = "text" | "number" | "date" | "checkbox" | "select";

const validateFieldType = (type: string): ValidFieldType => {
  const validTypes: ValidFieldType[] = ["text", "number", "date", "checkbox", "select"];
  if (validTypes.includes(type as ValidFieldType)) {
    return type as ValidFieldType;
  }
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
      const requiredFields = await stageAPI.getRequiredFieldsByStageId(stageBase.id);
      const requiredTasks = await stageAPI.getRequiredTasksByStageId(stageBase.id);
      stages.push({
        ...stageBase,
        opportunities,
        requiredFields,
        requiredTasks
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
      const requiredFields = await stageAPI.getRequiredFieldsByStageId(stageBase.id);
      const requiredTasks = await stageAPI.getRequiredTasksByStageId(stageBase.id);
      stages.push({
        ...stageBase,
        opportunities,
        requiredFields,
        requiredTasks
      });
    }
    
    return stages;
  },

  getById: async (id: string): Promise<Stage | null> => {
    const { data, error } = await supabase.from('stages').select('*').eq('id', id).single();
    if (error || !data) return null;
    
    const stageBase = mapDbStageToStage(data);
    const opportunities = await opportunityAPI.getByStageId(id);
    const requiredFields = await stageAPI.getRequiredFieldsByStageId(id);
    const requiredTasks = await stageAPI.getRequiredTasksByStageId(id);
    
    return {
      ...stageBase,
      opportunities,
      requiredFields,
      requiredTasks
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

  getRequiredTasksByStageId: async (stageId: string): Promise<RequiredTask[]> => {
    const { data, error } = await supabase
      .from('required_tasks')
      .select('*')
      .eq('stage_id', stageId);
      
    if (error) {
      console.error("Error fetching required tasks:", error);
      return [];
    }
    
    return (data || []).map(task => ({
      id: task.id,
      name: task.name,
      description: task.description,
      defaultDuration: task.default_duration,
      templateId: task.template_id,
      isRequired: task.is_required,
      stageId: task.stage_id
    }));
  },

  create: async (data: StageFormData): Promise<Stage> => {
    console.log("Criando etapa com os dados:", data);
    
    let nextOrder = 0;
    try {
      const { data: stagesData, error: stagesError } = await supabase
        .from('stages')
        .select('order')
        .eq('funnel_id', data.funnelId)
        .order('order', { ascending: false })
        .limit(1);
        
      if (!stagesError && stagesData && stagesData.length > 0) {
        nextOrder = (stagesData[0].order || 0) + 1;
      }
    } catch (e) {
      console.error("Error determining next order:", e);
    }
    
    const { data: created, error } = await supabase.from('stages').insert([{ 
      name: data.name, 
      description: data.description, 
      funnel_id: data.funnelId,
      color: data.color || '#CCCCCC',
      is_win_stage: data.isWinStage || false,
      is_loss_stage: data.isLossStage || false,
      order: nextOrder,
      alert_config: data.alertConfig ? {
        enabled: data.alertConfig.enabled,
        maxDaysInStage: data.alertConfig.maxDaysInStage,
        alertMessage: data.alertConfig.alertMessage
      } : null,
      migrate_config: data.migrateConfig ? {
        enabled: data.migrateConfig.enabled,
        target_funnel_id: data.migrateConfig.targetFunnelId,
        target_stage_id: data.migrateConfig.targetStageId
      } : null
    }]).select().single();
    
    if (error || !created) {
      console.error("Erro ao criar etapa:", error);
      throw error || new Error('Stage create error');
    }
    
    const stageBase = mapDbStageToStage(created);
    
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

    const requiredTasks: RequiredTask[] = [];
    if (data.requiredTasks && data.requiredTasks.length > 0) {
      for (const task of data.requiredTasks) {
        const addedTask = await stageAPI.addRequiredTask({
          name: task.name,
          description: task.description,
          defaultDuration: task.defaultDuration,
          templateId: task.templateId,
          isRequired: task.isRequired,
          stageId: created.id
        });
        
        if (addedTask) {
          requiredTasks.push(addedTask);
        }
      }
    }
    
    await triggerEntityWebhooks('stage', created.id, 'create', created);
    
    return {
      ...stageBase,
      opportunities: [],
      requiredFields,
      requiredTasks
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
    if (data.order !== undefined) dbData.order = data.order;
    if (data.funnelId !== undefined) dbData.funnel_id = data.funnelId;
    
    // Handle alert config correctly
    if (data.alertConfig !== undefined) {
      if (data.alertConfig && data.alertConfig.enabled) {
        dbData.alert_config = {
          enabled: data.alertConfig.enabled,
          maxDaysInStage: data.alertConfig.maxDaysInStage,
          alertMessage: data.alertConfig.alertMessage
        };
      } else {
        dbData.alert_config = null;
      }
    }
    
    // Handle migrate config correctly
    if (data.migrateConfig !== undefined) {
      if (data.migrateConfig && data.migrateConfig.enabled) {
        dbData.migrate_config = {
          enabled: data.migrateConfig.enabled,
          target_funnel_id: data.migrateConfig.targetFunnelId,
          target_stage_id: data.migrateConfig.targetStageId
        };
      } else {
        dbData.migrate_config = null;
      }
    }
    
    console.log("Dados para o banco:", dbData);
    
    const { data: updated, error } = await supabase.from('stages').update(dbData).eq('id', id).select().single();
    
    if (error) {
      console.error("Erro ao atualizar etapa:", error);
      throw error;
    }
    
    if (!updated) {
      console.error("Não foi possível atualizar a etapa. Nenhum dado retornado.");
      throw new Error("Failed to update stage");
    }
    
    // Update required fields if provided
    if (data.requiredFields !== undefined) {
      await supabase.from('required_fields').delete().eq('stage_id', id);
      
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

    // Update required tasks if provided
    if (data.requiredTasks !== undefined) {
      await supabase.from('required_tasks').delete().eq('stage_id', id);
      
      for (const task of data.requiredTasks) {
        await stageAPI.addRequiredTask({
          name: task.name,
          description: task.description,
          defaultDuration: task.defaultDuration,
          templateId: task.templateId,
          isRequired: task.isRequired,
          stageId: id
        });
      }
    }
    
    await triggerEntityWebhooks('stage', id, 'update', updated);
    
    const stageBase = mapDbStageToStage(updated);
    const opportunities = await opportunityAPI.getByStageId(id);
    const requiredFields = data.requiredFields || await stageAPI.getRequiredFieldsByStageId(id);
    const requiredTasks = data.requiredTasks || await stageAPI.getRequiredTasksByStageId(id);
    
    return {
      ...stageBase,
      opportunities,
      requiredFields,
      requiredTasks
    };
  },

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

  addRequiredTask: async (taskData: {
    name: string;
    description?: string;
    defaultDuration: number;
    templateId?: string;
    isRequired: boolean;
    stageId: string;
  }): Promise<RequiredTask | null> => {
    const { data, error } = await supabase.from('required_tasks').insert([{
      name: taskData.name,
      description: taskData.description,
      default_duration: taskData.defaultDuration,
      template_id: taskData.templateId,
      is_required: taskData.isRequired,
      stage_id: taskData.stageId
    }]).select().single();
    
    if (error || !data) {
      console.error("Error adding required task:", error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      defaultDuration: data.default_duration,
      templateId: data.template_id,
      isRequired: data.is_required,
      stageId: data.stage_id
    };
  },

  delete: async (id: string): Promise<boolean> => {
    await supabase.from('required_fields').delete().eq('stage_id', id);
    await supabase.from('required_tasks').delete().eq('stage_id', id);
    const { error } = await supabase.from('stages').delete().eq('id', id);
    return !error;
  }
};
