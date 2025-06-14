
import { useState } from "react";
import { Opportunity, RequiredField } from "@/types";
import RequiredFieldsDialog from "../opportunity/RequiredFieldsDialog";
import { useConfetti } from "@/hooks/useConfetti";
import { toast } from "sonner";

interface RequiredFieldsHandlerProps {
  children: React.ReactNode;
  stages: any[];
}

export const RequiredFieldsHandler = ({ children, stages }: RequiredFieldsHandlerProps) => {
  const [showRequiredFieldsDialog, setShowRequiredFieldsDialog] = useState(false);
  const [currentDragOperation, setCurrentDragOperation] = useState<{
    opportunity: Opportunity;
    sourceStageId: string;
    destinationStageId: string;
    destinationIndex: number;
    requiredFields: RequiredField[];
  } | null>(null);
  const { fireWinConfetti } = useConfetti();

  const handleRequiredFieldsComplete = (success: boolean, updatedOpportunity?: Opportunity) => {
    if (success && currentDragOperation && updatedOpportunity) {
      const { destinationStageId } = currentDragOperation;
      
      // Check if moving to a win stage and fire confetti
      const destinationStage = stages.find(stage => stage.id === destinationStageId);
      if (destinationStage?.isWinStage) {
        setTimeout(() => {
          fireWinConfetti();
          toast.success("🎉 Parabéns! Oportunidade fechada com sucesso!");
        }, 300);
      }
    }
    
    // Reset the state
    setCurrentDragOperation(null);
  };

  return (
    <>
      {children}
      
      {/* Dialog for required fields */}
      {currentDragOperation && (
        <RequiredFieldsDialog
          open={showRequiredFieldsDialog}
          onOpenChange={setShowRequiredFieldsDialog}
          opportunity={currentDragOperation.opportunity}
          requiredFields={currentDragOperation.requiredFields}
          onComplete={handleRequiredFieldsComplete}
          stageId={currentDragOperation.destinationStageId}
        />
      )}
    </>
  );
};
