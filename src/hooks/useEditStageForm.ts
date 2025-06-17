
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Stage, RequiredField, RequiredTask, StageAlertConfig, StageMigrateConfig, SortingOption } from "@/types";
import { stageAPI } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  color: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Cor inválida"),
  isWinStage: z.boolean().optional(),
  isLossStage: z.boolean().optional()
}).refine(data => {
  return !(data.isWinStage && data.isLossStage);
}, {
  message: "Uma etapa não pode ser de vitória e perda ao mesmo tempo",
  path: ["isWinStage"]
});

export type StageFormData = z.infer<typeof formSchema>;

export const useEditStageForm = (stageId: string, open: boolean) => {
  const [stage, setStage] = useState<Stage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [requiredFields, setRequiredFields] = useState<RequiredField[]>([]);
  const [requiredTasks, setRequiredTasks] = useState<RequiredTask[]>([]);
  const [alertConfig, setAlertConfig] = useState<StageAlertConfig>({ enabled: false, maxDaysInStage: 3 });
  const [migrateConfig, setMigrateConfig] = useState<StageMigrateConfig>({ 
    enabled: false, 
    targetFunnelId: '', 
    targetStageId: '' 
  });
  const [sortConfig, setSortConfig] = useState<{ type: SortingOption; enabled: boolean }>({
    type: 'free',
    enabled: false
  });
  const [winReasonRequired, setWinReasonRequired] = useState(false);
  const [lossReasonRequired, setLossReasonRequired] = useState(false);
  const [winReasons, setWinReasons] = useState<string[]>([]);
  const [lossReasons, setLossReasons] = useState<string[]>([]);

  const form = useForm<StageFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3b82f6",
      isWinStage: false,
      isLossStage: false
    }
  });

  useEffect(() => {
    if (open && stageId) {
      loadStage();
    }
  }, [open, stageId]);

  const loadStage = async () => {
    try {
      setLoading(true);
      
      // Load stage data
      const stageData = await stageAPI.getById(stageId);
      if (!stageData) return;
      
      setStage(stageData);
      
      // Load required fields from database
      const { data: fieldsData } = await supabase
        .from('required_fields')
        .select('*')
        .eq('stage_id', stageId);
      
      if (fieldsData) {
        setRequiredFields(fieldsData.map(field => ({
          id: field.id,
          name: field.name,
          type: field.type as 'text' | 'number' | 'email' | 'phone' | 'select' | 'textarea',
          options: field.options || [],
          isRequired: field.is_required,
          stageId: field.stage_id
        })));
      }
      
      // Load required tasks from database
      const { data: tasksData } = await supabase
        .from('required_tasks')
        .select('*')
        .eq('stage_id', stageId);
      
      if (tasksData) {
        setRequiredTasks(tasksData.map(task => ({
          id: task.id,
          name: task.name,
          description: task.description || '',
          defaultDuration: task.default_duration || 1,
          isRequired: task.is_required,
          templateId: task.template_id,
          stageId: task.stage_id
        })));
      }
      
      // Set form values
      form.reset({
        name: stageData.name,
        description: stageData.description || "",
        color: stageData.color || "#3b82f6",
        isWinStage: stageData.isWinStage,
        isLossStage: stageData.isLossStage
      });
      
      // Set other configs
      setAlertConfig(stageData.alertConfig || { enabled: false, maxDaysInStage: 3 });
      setMigrateConfig(stageData.migrateConfig || { enabled: false, targetFunnelId: '', targetStageId: '' });
      setWinReasonRequired(stageData.winReasonRequired || false);
      setLossReasonRequired(stageData.lossReasonRequired || false);
      setWinReasons(stageData.winReasons || []);
      setLossReasons(stageData.lossReasons || []);
    } catch (error) {
      console.error("Error loading stage:", error);
      toast.error("Erro ao carregar dados da etapa");
    } finally {
      setLoading(false);
    }
  };

  const submitForm = async (values: StageFormData, onStageUpdated: (stage: Stage) => void) => {
    try {
      setIsSubmitting(true);
      
      // Update stage
      const updatedStage = await stageAPI.update(stageId, {
        ...values,
        alertConfig,
        migrateConfig,
        winReasonRequired,
        lossReasonRequired,
        winReasons,
        lossReasons
      });
      
      if (!updatedStage) {
        throw new Error("Failed to update stage");
      }
      
      // Save required fields to database
      // First delete existing fields
      await supabase
        .from('required_fields')
        .delete()
        .eq('stage_id', stageId);
      
      // Insert new fields
      if (requiredFields.length > 0) {
        const fieldsToInsert = requiredFields.map(field => ({
          stage_id: stageId,
          name: field.name,
          type: field.type,
          options: field.options,
          is_required: field.isRequired
        }));
        
        const { error: fieldsError } = await supabase
          .from('required_fields')
          .insert(fieldsToInsert);
        
        if (fieldsError) {
          console.error("Error saving required fields:", fieldsError);
          toast.error("Erro ao salvar campos obrigatórios");
        }
      }
      
      // Save required tasks to database
      // First delete existing tasks
      await supabase
        .from('required_tasks')
        .delete()
        .eq('stage_id', stageId);
      
      // Insert new tasks
      if (requiredTasks.length > 0) {
        const tasksToInsert = requiredTasks.map(task => ({
          stage_id: stageId,
          name: task.name,
          description: task.description,
          default_duration: task.defaultDuration,
          is_required: task.isRequired,
          template_id: task.templateId
        }));
        
        const { error: tasksError } = await supabase
          .from('required_tasks')
          .insert(tasksToInsert);
        
        if (tasksError) {
          console.error("Error saving required tasks:", tasksError);
          toast.error("Erro ao salvar tarefas obrigatórias");
        }
      }
      
      toast.success("Etapa atualizada com sucesso!");
      onStageUpdated(updatedStage);
      return true;
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error("Erro ao atualizar etapa");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    stage,
    loading,
    isSubmitting,
    form,
    requiredFields,
    setRequiredFields,
    requiredTasks,
    setRequiredTasks,
    alertConfig,
    setAlertConfig,
    migrateConfig,
    setMigrateConfig,
    sortConfig,
    setSortConfig,
    winReasonRequired,
    setWinReasonRequired,
    lossReasonRequired,
    setLossReasonRequired,
    winReasons,
    setWinReasons,
    lossReasons,
    setLossReasons,
    submitForm
  };
};
