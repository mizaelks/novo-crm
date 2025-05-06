
import { RequiredField, Opportunity } from "@/types";
import { useForm } from "react-hook-form";
import { opportunityAPI, stageAPI } from "@/services/api";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CustomFieldInfo from "./CustomFieldInfo";

interface CustomFieldsFormProps {
  opportunity: Opportunity;
  requiredFields: RequiredField[];
  onCustomFieldsUpdated: (opportunity: Opportunity) => void;
}

const CustomFieldsForm = ({ opportunity, requiredFields, onCustomFieldsUpdated }: CustomFieldsFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inheritedFields, setInheritedFields] = useState<RequiredField[]>([]);
  const [isLoadingInheritedFields, setIsLoadingInheritedFields] = useState(false);
  
  // Form for custom fields
  const customFieldsForm = useForm({
    defaultValues: {
      customFields: opportunity.customFields || {}
    }
  });

  // Ensure form updates when opportunity changes
  useEffect(() => {
    customFieldsForm.reset({
      customFields: opportunity.customFields || {}
    });
  }, [opportunity, customFieldsForm]);

  // Carrega campos personalizados herdados quando não há campos definidos na etapa atual
  useEffect(() => {
    const loadInheritedFields = async () => {
      // Apenas carregar campos herdados se não houver campos requeridos na etapa atual
      if (!requiredFields || requiredFields.length === 0) {
        setIsLoadingInheritedFields(true);
        try {
          // Busca todas as etapas do funil
          const stages = await stageAPI.getByFunnelId(opportunity.funnelId);
          
          // Ordena as etapas por ordem
          const orderedStages = stages.sort((a, b) => a.order - b.order);
          
          // Encontra a posição da etapa atual
          const currentStageIndex = orderedStages.findIndex(stage => stage.id === opportunity.stageId);
          
          if (currentStageIndex > 0) {
            // Tenta encontrar campos personalizados de etapas anteriores (da mais recente para a mais antiga)
            for (let i = currentStageIndex - 1; i >= 0; i--) {
              const previousStage = orderedStages[i];
              const previousStageDetails = await stageAPI.getById(previousStage.id);
              
              if (previousStageDetails && previousStageDetails.requiredFields && previousStageDetails.requiredFields.length > 0) {
                console.log("Campos herdados encontrados na etapa:", previousStageDetails.name);
                setInheritedFields(previousStageDetails.requiredFields);
                break;
              }
            }
          }
        } catch (error) {
          console.error("Erro ao carregar campos herdados:", error);
        } finally {
          setIsLoadingInheritedFields(false);
        }
      }
    };

    loadInheritedFields();
  }, [opportunity.funnelId, opportunity.stageId, requiredFields]);

  const handleSubmitCustomFields = async (values: any) => {
    if (!opportunity) return;
    
    try {
      setIsSubmitting(true);
      
      // Transforme os nomes dos campos para o formato correto
      const formattedCustomFields: Record<string, any> = {};
      Object.entries(values.customFields).forEach(([key, value]) => {
        // Garante que o nome do campo mantenha o formato original
        formattedCustomFields[key] = value;
      });
      
      console.log("Enviando atualização para a oportunidade:", opportunity.id);
      console.log("Dados a serem enviados:", formattedCustomFields);
      
      // Garante que estamos enviando um objeto de campos personalizados válido
      const updatedOpportunity = await opportunityAPI.update(opportunity.id, {
        customFields: formattedCustomFields
      });
      
      if (updatedOpportunity) {
        console.log("Resposta da API:", updatedOpportunity);
        onCustomFieldsUpdated(updatedOpportunity);
        toast.success("Campos personalizados atualizados com sucesso");
      } else {
        console.error("Erro na resposta da API");
        toast.error("Erro ao atualizar campos personalizados");
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

  // Determina quais campos exibir (campos da etapa atual ou campos herdados)
  const fieldsToDisplay = requiredFields && requiredFields.length > 0 ? requiredFields : inheritedFields;
  const isInherited = requiredFields.length === 0 && inheritedFields.length > 0;

  if (isLoadingInheritedFields) {
    return (
      <div className="py-6 space-y-4">
        <div className="h-4 bg-muted animate-pulse rounded-md w-3/4 mx-auto"></div>
        <div className="h-10 bg-muted animate-pulse rounded-md w-full"></div>
        <div className="h-10 bg-muted animate-pulse rounded-md w-full"></div>
      </div>
    );
  }

  if (!fieldsToDisplay || fieldsToDisplay.length === 0) {
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
      {isInherited && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <p className="text-sm">
            Exibindo campos personalizados herdados de estágios anteriores.
            Os valores preenchidos serão preservados ao mover a oportunidade.
          </p>
        </div>
      )}
      
      <form onSubmit={customFieldsForm.handleSubmit(handleSubmitCustomFields)} className="space-y-4">
        {fieldsToDisplay.map(field => (
          <FormField
            key={field.id}
            control={customFieldsForm.control}
            name={`customFields.${field.name}`}
            render={({ field: formField }) => (
              <FormItem key={field.id}>
                <div className="flex items-center gap-2">
                  <FormLabel>{field.name}</FormLabel>
                  {field.isRequired && (
                    <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                  )}
                  {isInherited && (
                    <Badge variant="secondary" className="text-xs">Herdado</Badge>
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
