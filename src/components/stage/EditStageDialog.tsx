import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stage, RequiredField, StageAlertConfig } from "@/types";
import { stageAPI } from "@/services/api";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import StageRequiredFields from "./StageRequiredFields";
import { StageAlertConfigComponent } from "./StageAlertConfig";
import { StageBasicForm } from "./StageBasicForm";
import { StageTypeToggles } from "./StageTypeToggles";

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

interface EditStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageId: string;
  onStageUpdated: (stage: Stage) => void;
}

const EditStageDialog = ({
  open,
  onOpenChange,
  stageId,
  onStageUpdated
}: EditStageDialogProps) => {
  const [stage, setStage] = useState<Stage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requiredFields, setRequiredFields] = useState<RequiredField[]>([]);
  const [alertConfig, setAlertConfig] = useState<StageAlertConfig>({ enabled: false, maxDaysInStage: 3 });

  const form = useForm<z.infer<typeof formSchema>>({
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
            
            // Handle alert config properly
            const config = stageData.alertConfig || { enabled: false, maxDaysInStage: 3 };
            setAlertConfig(config);
            
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!stage) {
      console.error("Stage data not loaded");
      toast.error("Dados da etapa não carregados");
      return;
    }
    
    try {
      console.log("Enviando atualização para a etapa:", stageId);
      console.log("Form values:", values);
      console.log("Alert config:", alertConfig);
      console.log("Required fields:", requiredFields);
      
      setIsSubmitting(true);
      
      const updateData = {
        name: values.name,
        description: values.description,
        funnelId: stage.funnelId,
        color: values.color,
        isWinStage: values.isWinStage,
        isLossStage: values.isLossStage,
        requiredFields: requiredFields,
        alertConfig: alertConfig.enabled ? alertConfig : undefined
      };
      
      console.log("Dados para atualização:", updateData);
      
      const updatedStage = await stageAPI.update(stageId, updateData);
      
      console.log("Resposta da API:", updatedStage);
      
      if (updatedStage) {
        onStageUpdated(updatedStage);
        toast.success("Etapa atualizada com sucesso!");
        onOpenChange(false);
      } else {
        toast.error("Erro ao atualizar etapa");
      }
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error("Erro ao atualizar etapa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle>Editar etapa</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="space-y-2 px-6">
            <div className="h-10 bg-muted animate-pulse rounded-md" />
            <div className="h-10 bg-muted animate-pulse rounded-md" />
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
        ) : (
          <div className="px-6">
            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-4">
                <StageBasicForm form={form} />
                
                <StageTypeToggles form={form} />
                
                <Separator className="my-4" />
                
                <StageAlertConfigComponent
                  alertConfig={alertConfig}
                  onAlertConfigChange={setAlertConfig}
                />
                
                <Separator className="my-4" />
                
                <StageRequiredFields 
                  requiredFields={requiredFields}
                  setRequiredFields={setRequiredFields}
                  stageId={stageId}
                />
                
                <DialogFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditStageDialog;
