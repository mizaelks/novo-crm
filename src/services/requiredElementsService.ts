
import { supabase } from "@/integrations/supabase/client";
import { Opportunity, RequiredField, RequiredTask } from "@/types";

// Type for action_config to handle the Json type properly
interface TaskActionConfig {
  title?: string;
  description?: string;
  assignedTo?: string | null;
  nextStageId?: string | null;
  moveToNextStage?: boolean;
}

export const requiredElementsService = {
  // Adiciona tarefas obrigatórias a uma oportunidade
  addRequiredTasksToOpportunity: async (
    opportunityId: string, 
    requiredTasks: RequiredTask[]
  ): Promise<boolean> => {
    try {
      console.log('Adding required tasks to opportunity:', opportunityId, requiredTasks);
      
      if (!requiredTasks || requiredTasks.length === 0) {
        return true;
      }

      // Buscar tarefas existentes da oportunidade
      const { data: existingTasks } = await supabase
        .from('scheduled_actions')
        .select('*')
        .eq('opportunity_id', opportunityId)
        .eq('action_type', 'task');

      const existingTaskNames = (existingTasks || []).map(task => {
        const actionConfig = task.action_config as TaskActionConfig;
        return actionConfig?.title || '';
      });

      // Filtrar tarefas que ainda não existem
      const tasksToCreate = requiredTasks.filter(task => 
        !existingTaskNames.includes(task.name)
      );

      if (tasksToCreate.length === 0) {
        console.log('All required tasks already exist');
        return true;
      }

      // Criar as tarefas obrigatórias
      const tasksData = tasksToCreate.map(task => {
        const scheduledDateTime = new Date();
        scheduledDateTime.setHours(scheduledDateTime.getHours() + (task.defaultDuration || 1));

        return {
          opportunity_id: opportunityId,
          action_type: 'task',
          action_config: {
            title: task.name,
            description: task.description || '',
            assignedTo: null,
            nextStageId: null,
            moveToNextStage: false
          },
          scheduled_datetime: scheduledDateTime.toISOString(),
          status: 'pending',
          template_id: task.templateId || null
        };
      });

      const { error } = await supabase
        .from('scheduled_actions')
        .insert(tasksData);

      if (error) {
        console.error('Error creating required tasks:', error);
        return false;
      }

      console.log(`Created ${tasksToCreate.length} required tasks`);
      return true;
    } catch (error) {
      console.error('Error in addRequiredTasksToOpportunity:', error);
      return false;
    }
  },

  // Adiciona campos obrigatórios vazios aos custom fields da oportunidade
  addRequiredFieldsToOpportunity: async (
    opportunity: Opportunity,
    requiredFields: RequiredField[]
  ): Promise<Opportunity | null> => {
    try {
      console.log('Adding required fields to opportunity:', opportunity.id, requiredFields);
      
      if (!requiredFields || requiredFields.length === 0) {
        return opportunity;
      }

      const currentCustomFields = opportunity.customFields || {};
      let hasChanges = false;

      // Adicionar campos que ainda não existem
      requiredFields.forEach(field => {
        if (!(field.name in currentCustomFields)) {
          // Definir valor padrão baseado no tipo do campo
          let defaultValue: any = '';
          
          switch (field.type) {
            case 'checkbox':
              defaultValue = false;
              break;
            case 'number':
              defaultValue = 0;
              break;
            case 'date':
              defaultValue = '';
              break;
            case 'select':
              defaultValue = '';
              break;
            default:
              defaultValue = '';
          }

          currentCustomFields[field.name] = defaultValue;
          hasChanges = true;
        }
      });

      if (!hasChanges) {
        console.log('All required fields already exist');
        return opportunity;
      }

      // Atualizar a oportunidade com os novos campos
      const { data: updated, error } = await supabase
        .from('opportunities')
        .update({ custom_fields: currentCustomFields })
        .eq('id', opportunity.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating opportunity custom fields:', error);
        return null;
      }

      console.log('Required fields added successfully');
      return { ...opportunity, customFields: currentCustomFields };
    } catch (error) {
      console.error('Error in addRequiredFieldsToOpportunity:', error);
      return null;
    }
  },

  // Busca tarefas e campos obrigatórios de uma etapa
  getStageRequirements: async (stageId: string): Promise<{
    requiredFields: RequiredField[];
    requiredTasks: RequiredTask[];
  }> => {
    try {
      const [fieldsResult, tasksResult] = await Promise.all([
        supabase
          .from('required_fields')
          .select('*')
          .eq('stage_id', stageId),
        supabase
          .from('required_tasks')
          .select('*')
          .eq('stage_id', stageId)
      ]);

      const requiredFields: RequiredField[] = (fieldsResult.data || []).map(field => ({
        id: field.id,
        name: field.name,
        type: field.type === 'email' || field.type === 'phone' || field.type === 'textarea' ? 'text' : 
              field.type === 'number' ? 'number' :
              field.type === 'date' ? 'date' :
              field.type === 'checkbox' ? 'checkbox' :
              field.type === 'select' ? 'select' : 'text',
        options: field.options || [],
        isRequired: field.is_required,
        stageId: field.stage_id
      }));

      const requiredTasks: RequiredTask[] = (tasksResult.data || []).map(task => ({
        id: task.id,
        name: task.name,
        description: task.description || '',
        defaultDuration: task.default_duration || 1,
        isRequired: task.is_required,
        templateId: task.template_id,
        stageId: task.stage_id
      }));

      return { requiredFields, requiredTasks };
    } catch (error) {
      console.error('Error getting stage requirements:', error);
      return { requiredFields: [], requiredTasks: [] };
    }
  },

  // Processa automaticamente todos os requisitos de uma etapa
  processStageRequirements: async (
    opportunity: Opportunity,
    destinationStageId: string
  ): Promise<Opportunity | null> => {
    try {
      console.log('Processing stage requirements for opportunity:', opportunity.id, 'stage:', destinationStageId);
      
      // Ensure we have a valid opportunity
      if (!opportunity || !opportunity.id) {
        console.error('Invalid opportunity provided');
        return null;
      }
      
      const stageRequirements = await this.getStageRequirements(destinationStageId);
      
      // Add null checks for stageRequirements properties
      if (!stageRequirements) {
        console.log('No stage requirements found');
        return opportunity;
      }
      
      const requiredFields = stageRequirements.requiredFields || [];
      const requiredTasks = stageRequirements.requiredTasks || [];
      
      let updatedOpportunity: Opportunity | null = opportunity;

      // Adicionar campos obrigatórios
      if (requiredFields && requiredFields.length > 0 && updatedOpportunity) {
        const fieldResult = await this.addRequiredFieldsToOpportunity(updatedOpportunity, requiredFields);
        if (fieldResult) {
          updatedOpportunity = fieldResult;
        } else {
          console.error('Failed to add required fields');
        }
      }

      // Adicionar tarefas obrigatórias - with null check
      if (requiredTasks && requiredTasks.length > 0 && updatedOpportunity?.id) {
        const tasksSuccess = await this.addRequiredTasksToOpportunity(updatedOpportunity.id, requiredTasks);
        if (!tasksSuccess) {
          console.error('Failed to add required tasks');
        }
      }

      // Ensure we return the updated opportunity - with null check
      return updatedOpportunity || opportunity;
    } catch (error) {
      console.error('Error processing stage requirements:', error);
      return null;
    }
  }
};
