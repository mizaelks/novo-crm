
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Opportunity, RequiredField } from "@/types";
import { useState } from "react";
import { opportunityAPI } from "@/services/api";
import { toast } from "sonner";
import CustomFieldsForm from "../customFields/CustomFieldsForm";
import { AlertCircle } from "lucide-react";

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
  
  // Filter to only show the required fields
  const missingRequiredFields = requiredFields.filter(field => field.isRequired);
  
  const handleCustomFieldsUpdated = async (updatedOpportunity: Opportunity) => {
    try {
      setIsSubmitting(true);
      
      // Check if all required fields are filled now
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
      
      // Update opportunity with new stage ID
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
  
  if (!opportunity) return null;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !isSubmitting) {
        onComplete(false);
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Campos obrigatórios para esta etapa
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-6">
            Esta etapa possui campos obrigatórios que precisam ser preenchidos antes de mover a oportunidade.
          </p>
          
          <CustomFieldsForm
            opportunity={opportunity}
            requiredFields={missingRequiredFields}
            onCustomFieldsUpdated={handleCustomFieldsUpdated}
          />
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              onComplete(false);
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button disabled={true} className="opacity-0">Placeholder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequiredFieldsDialog;
