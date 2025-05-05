
import { RequiredField, Opportunity } from "@/types";
import { useForm } from "react-hook-form";
import { opportunityAPI } from "@/services/api";
import { toast } from "sonner";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomFieldsFormProps {
  opportunity: Opportunity;
  requiredFields: RequiredField[];
  onCustomFieldsUpdated: (opportunity: Opportunity) => void;
}

const CustomFieldsForm = ({ opportunity, requiredFields, onCustomFieldsUpdated }: CustomFieldsFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form for custom fields
  const customFieldsForm = useForm({
    defaultValues: {
      customFields: opportunity.customFields || {}
    }
  });

  const handleSubmitCustomFields = async (values: any) => {
    if (!opportunity) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedOpportunity = await opportunityAPI.update(opportunity.id, {
        customFields: values.customFields
      });
      
      if (updatedOpportunity) {
        onCustomFieldsUpdated(updatedOpportunity);
        toast.success("Campos personalizados atualizados com sucesso");
      } else {
        throw new Error("Falha ao atualizar campos personalizados");
      }
    } catch (error) {
      console.error("Error updating custom fields:", error);
      toast.error("Erro ao atualizar campos personalizados");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar os campos personalizados
  const renderCustomFieldControl = (field: RequiredField, formField: any) => {
    switch (field.type) {
      case 'text':
        return (
          <Input 
            value={formField.value || ''} 
            onChange={(e) => formField.onChange(e.target.value)}
            placeholder={`Digite ${field.name}`} 
          />
        );
      case 'number':
        return (
          <Input 
            type="number"
            value={formField.value || ''} 
            onChange={(e) => formField.onChange(e.target.value)}
            placeholder={`Digite ${field.name}`} 
          />
        );
      case 'date':
        return (
          <Input 
            type="date"
            value={formField.value || ''} 
            onChange={(e) => formField.onChange(e.target.value)}
          />
        );
      case 'checkbox':
        return (
          <Checkbox 
            checked={formField.value || false}
            onCheckedChange={formField.onChange}
          />
        );
      case 'select':
        if (field.options && field.options.length > 0) {
          return (
            <Select 
              value={formField.value || ''}
              onValueChange={formField.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Selecione ${field.name}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((option: string, index: number) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        return null;
      default:
        return null;
    }
  };

  if (!requiredFields || requiredFields.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>Não há campos personalizados configurados para esta etapa.</p>
        <p className="mt-2">
          Para adicionar campos personalizados, edite a etapa atual no kanban.
        </p>
      </div>
    );
  }

  return (
    <Form {...customFieldsForm}>
      <form onSubmit={customFieldsForm.handleSubmit(handleSubmitCustomFields)} className="space-y-4">
        {requiredFields.map(field => (
          <FormField
            key={field.id}
            control={customFieldsForm.control}
            name={`customFields.${field.name}`}
            render={({ field: formField }) => (
              <FormItem key={`item-${field.id}`}>
                <div className="flex items-center gap-2">
                  <FormLabel>{field.name}</FormLabel>
                  {field.isRequired && (
                    <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                  )}
                </div>
                <FormControl>
                  {renderCustomFieldControl(field, formField)}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        
        <div className="flex justify-end mt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar campos"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CustomFieldsForm;
