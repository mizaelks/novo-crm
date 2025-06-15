
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { FormValues } from "../schemas/formSchemas";

interface TaskFieldsProps {
  control: Control<FormValues>;
}

export const TaskFields = ({ control }: TaskFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Título da Tarefa</FormLabel>
            <FormControl>
              <Input placeholder="Ligar para o cliente" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição (opcional)</FormLabel>
            <FormControl>
              <Textarea placeholder="Detalhes da tarefa..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="assignedTo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Atribuir a (opcional)</FormLabel>
            <FormControl>
              <Input placeholder="Nome do responsável" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
