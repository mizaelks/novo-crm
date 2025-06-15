
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Control } from "react-hook-form";
import { Stage } from "@/types";
import { FormValues } from "../schemas/formSchemas";

interface StageToggleProps {
  control: Control<FormValues>;
  nextStage: Stage | null;
}

export const StageToggle = ({ control, nextStage }: StageToggleProps) => {
  if (!nextStage) return null;

  return (
    <FormField
      control={control}
      name="moveToNextStage"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
          <div className="space-y-0.5">
            <FormLabel>Mover para próxima etapa</FormLabel>
            <div className="text-sm text-muted-foreground">
              Ao concluir, mover para "{nextStage.name}"
            </div>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
