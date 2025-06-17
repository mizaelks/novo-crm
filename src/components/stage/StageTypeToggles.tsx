
import { UseFormReturn } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { stageAPI } from "@/services/api";
import { toast } from "sonner";

interface StageTypeTogglesProps {
  form: UseFormReturn<any>;
  funnelId?: string;
  currentStageId?: string;
}

export const StageTypeToggles = ({ form, funnelId, currentStageId }: StageTypeTogglesProps) => {
  const [existingWinStage, setExistingWinStage] = useState<string | null>(null);
  const [existingLossStage, setExistingLossStage] = useState<string | null>(null);

  useEffect(() => {
    if (funnelId) {
      checkExistingStages();
    }
  }, [funnelId]);

  const checkExistingStages = async () => {
    try {
      const stages = await stageAPI.getByFunnelId(funnelId!);
      const winStage = stages.find(s => s.isWinStage && s.id !== currentStageId);
      const lossStage = stages.find(s => s.isLossStage && s.id !== currentStageId);
      
      setExistingWinStage(winStage?.id || null);
      setExistingLossStage(lossStage?.id || null);
    } catch (error) {
      console.error("Error checking existing stages:", error);
    }
  };

  const handleWinStageChange = (checked: boolean) => {
    if (checked && existingWinStage) {
      toast.error("Já existe uma etapa de vitória neste funil. Apenas uma etapa de vitória é permitida por funil.");
      return;
    }
    form.setValue("isWinStage", checked);
    if (checked) {
      form.setValue("isLossStage", false);
    }
  };

  const handleLossStageChange = (checked: boolean) => {
    if (checked && existingLossStage) {
      toast.error("Já existe uma etapa de perda neste funil. Apenas uma etapa de perda é permitida por funil.");
      return;
    }
    form.setValue("isLossStage", checked);
    if (checked) {
      form.setValue("isWinStage", false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="isWinStage"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Etapa de Vitória</FormLabel>
              <div className="text-xs text-muted-foreground">
                Oportunidades nesta etapa são consideradas ganhas
                {existingWinStage && (
                  <div className="text-red-500 mt-1">
                    ⚠️ Já existe uma etapa de vitória neste funil
                  </div>
                )}
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={handleWinStageChange}
                disabled={!!existingWinStage && !field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="isLossStage"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Etapa de Perda</FormLabel>
              <div className="text-xs text-muted-foreground">
                Oportunidades nesta etapa são consideradas perdidas
                {existingLossStage && (
                  <div className="text-red-500 mt-1">
                    ⚠️ Já existe uma etapa de perda neste funil
                  </div>
                )}
              </div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={handleLossStageChange}
                disabled={!!existingLossStage && !field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
