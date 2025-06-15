
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { FormValues } from "../schemas/formSchemas";

interface WebhookFieldsProps {
  control: Control<FormValues>;
}

export const WebhookFields = ({ control }: WebhookFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL do webhook</FormLabel>
            <FormControl>
              <Input placeholder="https://api.exemplo.com/webhook" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Método</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método HTTP" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
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
              <Textarea placeholder="Descrição do webhook..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
