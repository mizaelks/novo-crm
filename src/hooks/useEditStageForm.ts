
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Stage, RequiredField, RequiredTask, StageAlertConfig, StageMigrateConfig, SortingOption } from "@/types";
import { stageAPI } from "@/services/api";
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
      color: "#CCCCCC",
      isWinStage: false,
      isLossStage: false
    }
  });

  useEffect(() => {
    const loadStage = async () => {
      if (open && stageId) {
        setLoading(true);
        console.log("Carregando dados da etapa:", stageId);
        
        try {
          const stageData = await stageAPI.getById(stageId);
          console.log("Etapa carregada:", stageData);
          
          if (stageData) {
            setStage(stageData);
            setRequiredFields(stageData.requiredFields || []);
            setRequiredTasks(stageData.requiredTasks || []);
            
            const alertConf = stageData.alertConfig || { enabled: false, maxDaysInStage: 3 };
            setAlertConfig(alertConf);
            
            const migrateConf = stageData.migrateConfig || { 
              enabled: false, 
              targetFunnelId: '', 
              targetStageId: '' 
            };
            setMigrateConfig(migrateConf);

            const sortConf = stageData.sortConfig || { type: 'free' as SortingOption, enabled: false };
            setSortConfig(sortConf);

            setWinReasonRequired(stageData.winReasonRequired || false);
            setLossReasonRequired(stageData.lossReasonRequired || false);
            setWinReasons(stageData.winReasons || []);
            setLossReasons(stageData.lossReasons || []);
            
            form.reset({
              name: stageData.name,
              description: stageData.description || "",
              color: stageData.color || "#CCCCCC",
              isWinStage: stageData.isWinStage || false,
              isLossStage: stageData.isLossStage || false
            });
          }
        } catch (error) {
          console.error("Error loading stage:", error);
          toast.error("Erro ao carregar dados da etapa");
        } finally {
          setLoading(false);
        }
      }
    };

    loadStage();
  }, [open, stageId, form]);

  const submitForm = async (values: StageFormData, onStageUpdated: (stage: Stage) => void) => {
    if (!stage) {
      console.error("Stage data not loaded");
      toast.error("Dados da etapa não carregados");
      return false;
    }
    
    try {
      console.log("Enviando atualização para a etapa:", stageId);
      
      setIsSubmitting(true);
      
      const updateData = {
        name: values.name,
        description: values.description,
        funnelId: stage.funnelId,
        color: values.color,
        isWinStage: values.isWinStage,
        isLossStage: values.isLossStage,
        requiredFields: requiredFields,
        requiredTasks: requiredTasks,
        alertConfig: alertConfig.enabled ? alertConfig : undefined,
        migrateConfig: migrateConfig.enabled ? migrateConfig : undefined,
        sortConfig: sortConfig.enabled ? sortConfig : undefined,
        winReasonRequired: winReasonRequired,
        lossReasonRequired: lossReasonRequired,
        winReasons: winReasons,
        lossReasons: lossReasons
      };
      
      console.log("Dados para atualização:", updateData);
      
      const updatedStage = await stageAPI.update(stageId, updateData);
      
      console.log("Resposta da API:", updatedStage);
      
      if (updatedStage) {
        onStageUpdated(updatedStage);
        toast.success("Etapa atualizada com sucesso!");
        return true;
      } else {
        toast.error("Erro ao atualizar etapa");
        return false;
      }
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
