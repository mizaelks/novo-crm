
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
import { Card } from "@/components/ui/card";

interface CustomFieldsFormProps {
  opportunity: Opportunity;
  requiredFields: RequiredField[];
  onCustomFieldsUpdated: (opportunity: Opportunity) => void;
}

const CustomFieldsForm = ({ opportunity, requiredFields, onCustomFieldsUpdated }: CustomFieldsFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inheritedFields, setInheritedFields] = useState<RequiredField[]>([]);
  const [isLoadingInheritedFields, setIsLoadingInheritedFields] = useState(false);
  
  const customFieldsForm = useForm({
    defaultValues: {
      customFields: opportunity.customFields || {}
    }
  });

  useEffect(() => {
    customFieldsForm.reset({
      customFields: opportunity.customFields || {}
    });
  }, [opportunity, customFieldsForm]);

  useEffect(() => {
    const loadInheritedFields = async () => {
      if (!requiredFields || requiredFields.length === 0) {
        setIsLoadingInheritedFields(true);
        try {
          const stages = await stageAPI.getByFunnelId(opportunity.funnelId);
          const orderedStages = stages.sort((a, b) => a.order - b.order);
          const currentStageIndex = orderedStages.findIndex(stage => stage.id === opportunity.stageId);
          
          if (currentStageIndex > 0) {
            for (let i = currentStageIndex - 1; i >= 0; i--) {
              const previousStage = orderedStages[i];
              const previousStageDetails = await stageAPI.getById(previousStage.id);
              
              if (previousStageDetails && previousStageDetails.requiredFields && previousStageDetails.requiredFields.length > 0) {
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
      
      const formattedCustomFields: Record<string, any> = {};
      Object.entries(values.customFields).forEach(([key, value]) => {
        formattedCustomFields[key] = value;
      });
      
      const updatedOpportunity = await opportunityAPI.update(opportunity.id, {
        customFields: formattedCustomFields
      });
      
      if (updatedOpportunity) {
        onCustomFieldsUpdated(updatedOpportunity);
        toast.success("Campos personalizados atualizados com sucesso");
      } else {
        toast.error("Erro ao atualizar campos personalizados");
      }
    } catch (error) {
      console.error("Error updating custom fields:", error);
      toast.error("Erro ao atualizar campos personalizados");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCustomFieldControl = (field: RequiredField, formField: any) => {
    switch (field.type) {
      case 'text':
        return (
          <Input 
            value={formField.value || ''} 
            onChange={(e) => formField.onChange(e.target.value)}
            placeholder={`Digite ${field.name}`}
            className="w-full"
          />
        );
      case 'number':
        return (
          <Input 
            type="number"
            value={formField.value || ''} 
            onChange={(e) => formField.onChange(e.target.value)}
            placeholder={`Digite ${field.name}`}
            className="w-full"
          />
        );
      case 'date':
        return (
          <Input 
            type="date"
            value={formField.value || ''} 
            onChange={(e) => formField.onChange(e.target.value)}
            className="w-full"
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={formField.value || false}
              onCheckedChange={formField.onChange}
              id={`checkbox-${field.id}`}
            />
            <label 
              htmlFor={`checkbox-${field.id}`} 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Sim
            </label>
          </div>
        );
      case 'select':
        if (field.options && field.options.length > 0) {
          return (
            <Select 
              value={formField.value || ''}
              onValueChange={formField.onChange}
            >
              <SelectTrigger className="w-full">
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

  const fieldsToDisplay = requiredFields && requiredFields.length > 0 ? requiredFields : inheritedFields;
  const isInherited = requiredFields.length === 0 && inheritedFields.length > 0;

  if (isLoadingInheritedFields) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-muted animate-pulse rounded-md" />
        <div className="h-10 bg-muted animate-pulse rounded-md" />
        <div className="h-10 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (!fieldsToDisplay || fieldsToDisplay.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Não há campos personalizados configurados para esta etapa.</p>
        <p className="text-xs mt-2 opacity-75">
          Para adicionar campos personalizados, edite a etapa atual no kanban.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Form {...customFieldsForm}>
        {isInherited && (
          <Card className="p-4 bg-accent/10 border-accent/20">
            <p className="text-sm text-muted-foreground">
              Exibindo campos personalizados herdados de estágios anteriores.
              Os valores preenchidos serão preservados ao mover a oportunidade.
            </p>
          </Card>
        )}
        
        <form onSubmit={customFieldsForm.handleSubmit(handleSubmitCustomFields)} className="space-y-4">
          <div className="space-y-4">
            {fieldsToDisplay.map(field => (
              <FormField
                key={field.id}
                control={customFieldsForm.control}
                name={`customFields.${field.name}`}
                render={({ field: formField }) => (
                  <FormItem className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FormLabel className="text-sm font-medium text-foreground">
                        {field.name}
                      </FormLabel>
                      <div className="flex gap-1">
                        {field.isRequired && (
                          <Badge variant="destructive" className="text-xs px-2 py-0.5">
                            Obrigatório
                          </Badge>
                        )}
                        {isInherited && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            Herdado
                          </Badge>
                        )}
                      </div>
                    </div>
                    <FormControl>
                      {renderCustomFieldControl(field, formField)}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Salvando..." : "Salvar e continuar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CustomFieldsForm;
