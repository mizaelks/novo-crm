
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Opportunity, RequiredField } from "@/types";
import { useState } from "react";
import { opportunityAPI } from "@/services/api";
import { toast } from "sonner";
import CustomFieldsForm from "../customFields/CustomFieldsForm";
import { AlertCircle, X } from "lucide-react";

interface RequiredFieldsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: Opportunity | null;
  requiredFields: RequiredField[];
  onComplete: (success: boolean, opportunity?: Opportunity) => void;
  stageId: string;
}

const RequiredFieldsDialog = ({
  open,
  onOpenChange,
  opportunity,
  requiredFields,
  onComplete,
  stageId
}: RequiredFieldsDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const missingRequiredFields = requiredFields.filter(field => field.isRequired);
  
  const handleCustomFieldsUpdated = async (updatedOpportunity: Opportunity) => {
    try {
      setIsSubmitting(true);
      
      const stillMissing: string[] = [];
      
      for (const field of missingRequiredFields) {
        const fieldValue = updatedOpportunity.customFields?.[field.name];
        
        if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
          stillMissing.push(field.name);
        } else if (field.type === 'checkbox' && fieldValue !== true) {
          stillMissing.push(field.name);
        }
      }
      
      if (stillMissing.length > 0) {
        toast.warning(`Ainda existem campos obrigatórios não preenchidos: ${stillMissing.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
      
      const finalOpportunity = await opportunityAPI.update(updatedOpportunity.id, {
        stageId: stageId
      });
      
      if (finalOpportunity) {
        onComplete(true, finalOpportunity);
        toast.success("Oportunidade movida com sucesso");
        onOpenChange(false);
      } else {
        throw new Error("Erro ao atualizar a oportunidade");
      }
      
    } catch (error) {
      console.error("Error updating required fields:", error);
      toast.error("Erro ao atualizar campos obrigatórios");
      onComplete(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onComplete(false);
      onOpenChange(false);
    }
  };
  
  if (!opportunity) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b pr-12">
          <div className="flex items-start justify-between pr-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-foreground">
                  Campos obrigatórios
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Preencha os campos necessários para continuar
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-accent/20 border border-accent/40 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground">
              Esta etapa possui <strong>{missingRequiredFields.length}</strong> campo(s) obrigatório(s) 
              que precisam ser preenchidos antes de mover a oportunidade.
            </p>
          </div>
          
          <CustomFieldsForm
            opportunity={opportunity}
            requiredFields={missingRequiredFields}
            onCustomFieldsUpdated={handleCustomFieldsUpdated}
          />
        </div>
        
        <div className="flex-shrink-0 p-6 pt-4 border-t bg-muted/20">
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequiredFieldsDialog;
