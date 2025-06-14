
import { UseFormReturn } from "react-hook-form";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface StageBasicFormProps {
  form: UseFormReturn<any>;
}

export const StageBasicForm = ({ form }: StageBasicFormProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome da etapa</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Qualificação" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Etapa de qualificação de leads" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cor da etapa</FormLabel>
            <div className="flex items-center gap-4">
              <FormControl>
                <Input type="color" {...field} className="w-14 h-10 p-1" />
              </FormControl>
              <Input 
                placeholder="#CCCCCC" 
                value={field.value} 
                onChange={e => field.onChange(e.target.value)}
                className="font-mono"
                maxLength={7}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
