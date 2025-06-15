
import { toast } from "sonner";
import { useConfetti } from "@/hooks/useConfetti";
import { triggerEntityWebhooks } from "@/services/utils/webhook";

interface UseKanbanHandlersProps {
  funnelId: string;
  stages: any[];
  onStageCreated: (stage: any) => void;
  onOpportunityCreated: (opportunity: any) => void;
  onStageUpdated: (stage: any) => void;
  completeOpportunityMove: (opportunity: any, sourceStageId: string, destinationStageId: string, destinationIndex: number, updatedOpportunity?: any) => void;
  resetDialogs: () => void;
  setShowReasonDialog: (show: boolean) => void;
}

export const useKanbanHandlers = ({
  funnelId,
  stages,
  onStageCreated,
  onOpportunityCreated,
  onStageUpdated,
  completeOpportunityMove,
  resetDialogs,
  setShowReasonDialog
}: UseKanbanHandlersProps) => {
  const { fireWinConfetti } = useConfetti();

  const handleStageCreated = (newStage: any) => {
    onStageCreated(newStage);
    
    // Trigger webhook for stage creation
    triggerEntityWebhooks(
      'stage', 
      newStage.id, 
      'create',
      {
        id: newStage.id,
        name: newStage.name,
        description: newStage.description,
        funnelId: funnelId
      }
    );
  };

  const handleOpportunityCreated = (newOpportunity: any) => {
    onOpportunityCreated(newOpportunity);
    
    // Trigger webhook for opportunity creation
    triggerEntityWebhooks(
      'opportunity', 
      newOpportunity.id, 
      'create',
      {
        id: newOpportunity.id,
        title: newOpportunity.title,
        client: newOpportunity.client,
        value: newOpportunity.value,
        stageId: newOpportunity.stageId,
        funnelId: newOpportunity.funnelId
      }
    );
  };

  const handleStageUpdated = (updatedStage: any) => {
    onStageUpdated(updatedStage);
    
    // Trigger webhook for stage update
    triggerEntityWebhooks(
      'stage', 
      updatedStage.id, 
      'update',
      {
        id: updatedStage.id,
        name: updatedStage.name,
        description: updatedStage.description,
        color: updatedStage.color,
        funnelId: funnelId,
        isWinStage: updatedStage.isWinStage,
        isLossStage: updatedStage.isLossStage
      }
    );
  };

  const handleRequiredFieldsComplete = (success: boolean, updatedOpportunity?: any, currentDragOperation?: any) => {
    console.log('handleRequiredFieldsComplete:', { success, updatedOpportunity, currentDragOperation });
    
    if (success && currentDragOperation) {
      const needsReasons = currentDragOperation.needsWinReason || currentDragOperation.needsLossReason;
      
      if (needsReasons) {
        console.log('Still need reasons, showing reason dialog');
        setShowReasonDialog(true);
        return;
      }
      
      console.log('No more requirements, completing move');
      completeOpportunityMove(
        currentDragOperation.opportunity,
        currentDragOperation.sourceStageId,
        currentDragOperation.destinationStageId,
        currentDragOperation.destinationIndex,
        updatedOpportunity
      );
    }
    
    if (!success || !currentDragOperation || !(currentDragOperation.needsWinReason || currentDragOperation.needsLossReason)) {
      console.log('Resetting current drag operation');
      resetDialogs();
    }
  };

  const handleReasonComplete = (success: boolean, updatedOpportunity?: any, currentDragOperation?: any) => {
    console.log('handleReasonComplete:', { success, updatedOpportunity, currentDragOperation });
    
    if (success && currentDragOperation) {
      const destinationStage = stages.find(stage => stage.id === currentDragOperation.destinationStageId);
      if (destinationStage?.isWinStage) {
        setTimeout(() => {
          fireWinConfetti();
          toast.success("🎉 Parabéns! Oportunidade fechada com sucesso!");
        }, 300);
      }
      
      completeOpportunityMove(
        currentDragOperation.opportunity,
        currentDragOperation.sourceStageId,
        currentDragOperation.destinationStageId,
        currentDragOperation.destinationIndex,
        updatedOpportunity
      );
    }
    
    resetDialogs();
  };

  return {
    handleStageCreated,
    handleOpportunityCreated,
    handleStageUpdated,
    handleRequiredFieldsComplete,
    handleReasonComplete
  };
};
