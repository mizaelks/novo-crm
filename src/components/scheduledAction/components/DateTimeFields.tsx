
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { FormValues } from "../schemas/formSchemas";

interface DateTimeFieldsProps {
  control: Control<FormValues>;
  todayForMin: string;
}

export const DateTimeFields = ({ control, todayForMin }: DateTimeFieldsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="scheduledDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data</FormLabel>
            <FormControl>
              <Input type="date" {...field} min={todayForMin} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="scheduledTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Horário</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
