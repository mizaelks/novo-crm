import { useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { RequiredField } from "@/types";
import { toast } from "sonner";
import KanbanSkeleton from "./KanbanSkeleton";
import KanbanHeader from "./KanbanHeader";
import KanbanStages from "./KanbanStages";
import CreateStageDialog from "../stage/CreateStageDialog";
import { triggerEntityWebhooks } from "@/services/utils/webhook";
import { useKanbanDragHandler } from "../../hooks/useKanbanDragHandler";
import RequiredFieldsDialog from "../opportunity/RequiredFieldsDialog";
import OpportunityReasonDialog from "../opportunity/OpportunityReasonDialog";
import { useConfetti } from "@/hooks/useConfetti";
import { useKanbanState } from "../../hooks/useKanbanState";

interface KanbanBoardProps {
  funnelId: string;
}

const KanbanBoard = ({ funnelId }: KanbanBoardProps) => {
  const [isCreateStageDialogOpen, setIsCreateStageDialogOpen] = useState(false);
  const { fireWinConfetti } = useConfetti();
  
  // Use the new kanban state hook
  const {
    funnel,
    stages,
    loading,
    setStages,
    handleStageCreated: onStageCreated,
    handleOpportunityCreated,
    handleStageUpdated
  } = useKanbanState(funnelId);
  
  // State for the required fields dialog
  const [showRequiredFieldsDialog, setShowRequiredFieldsDialog] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [currentDragOperation, setCurrentDragOperation] = useState<{
    opportunity: any;
    sourceStageId: string;
    destinationStageId: string;
    destinationIndex: number;
    requiredFields: RequiredField[];
    needsWinReason?: boolean;
    needsLossReason?: boolean;
    availableWinReasons?: string[];
    availableLossReasons?: string[];
  } | null>(null);
  
  // Use the extracted drag handler logic
  const { handleDragEnd: originalHandleDragEnd, completeOpportunityMove } = useKanbanDragHandler({
    stages,
    funnelId,
    setStages,
    setShowRequiredFieldsDialog: (show) => {
      console.log('setShowRequiredFieldsDialog called with:', show);
      if (show && currentDragOperation) {
        // Check if we need to show reason dialog instead of or after required fields
        const needsReasons = currentDragOperation.needsWinReason || currentDragOperation.needsLossReason;
        const hasRequiredFields = currentDragOperation.requiredFields?.length > 0;
        
        console.log('Dialog logic:', { needsReasons, hasRequiredFields });
        
        if (needsReasons && !hasRequiredFields) {
          console.log('Showing reason dialog directly');
          setShowReasonDialog(true);
        } else {
          console.log('Showing required fields dialog');
          setShowRequiredFieldsDialog(show);
        }
      } else {
        setShowRequiredFieldsDialog(show);
      }
    },
    setCurrentDragOperation: (operation) => {
      console.log('setCurrentDragOperation called with:', operation);
      setCurrentDragOperation(operation);
    }
  });

  // Wrap the original drag handler to add confetti for win stages
  const handleDragEnd = (result: DropResult) => {
    console.log("Drag end event:", result);
    
    // Check if moving to a win stage
    if (result.destination) {
      const destinationStage = stages.find(stage => stage.id === result.destination!.droppableId);
      if (destinationStage?.isWinStage) {
        // Fire confetti when moving to win stage
        setTimeout(() => {
          fireWinConfetti();
          toast.success("🎉 Parabéns! Oportunidade fechada com sucesso!");
        }, 300); // Small delay to let the visual update happen first
      }
    }
    
    // Call the original handler
    return originalHandleDragEnd(result);
  };

  const handleStageCreated = (newStage: any) => {
    onStageCreated(newStage);
    setIsCreateStageDialogOpen(false);
    
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

  const onOpportunityCreated = (newOpportunity: any) => {
    handleOpportunityCreated(newOpportunity);
    
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

  const onStageUpdated = (updatedStage: any) => {
    handleStageUpdated(updatedStage);
    
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
  
  const handleRequiredFieldsComplete = (success: boolean, updatedOpportunity?: any) => {
    console.log('handleRequiredFieldsComplete:', { success, updatedOpportunity, currentDragOperation });
    
    if (success && currentDragOperation) {
      // Check if we still need to collect win/loss reasons
      const needsReasons = currentDragOperation.needsWinReason || currentDragOperation.needsLossReason;
      
      if (needsReasons) {
        console.log('Still need reasons, showing reason dialog');
        // Update the current drag operation with the updated opportunity
        setCurrentDragOperation({
          ...currentDragOperation,
          opportunity: updatedOpportunity || currentDragOperation.opportunity
        });
        setShowRequiredFieldsDialog(false);
        setShowReasonDialog(true);
        return;
      }
      
      console.log('No more requirements, completing move');
      // No reasons needed, complete the move
      completeOpportunityMove(
        currentDragOperation.opportunity,
        currentDragOperation.sourceStageId,
        currentDragOperation.destinationStageId,
        currentDragOperation.destinationIndex,
        updatedOpportunity
      );
    }
    
    // Reset the state if not successful or no reasons needed
    if (!success || !currentDragOperation || !(currentDragOperation.needsWinReason || currentDragOperation.needsLossReason)) {
      console.log('Resetting current drag operation');
      setCurrentDragOperation(null);
      setShowRequiredFieldsDialog(false);
    }
  };

  const handleReasonComplete = (success: boolean, updatedOpportunity?: any) => {
    console.log('handleReasonComplete:', { success, updatedOpportunity, currentDragOperation });
    
    if (success && currentDragOperation) {
      // Check if moving to a win stage and fire confetti
      const destinationStage = stages.find(stage => stage.id === currentDragOperation.destinationStageId);
      if (destinationStage?.isWinStage) {
        setTimeout(() => {
          fireWinConfetti();
          toast.success("🎉 Parabéns! Oportunidade fechada com sucesso!");
        }, 300);
      }
      
      // Complete the move with the updated opportunity
      completeOpportunityMove(
        currentDragOperation.opportunity,
        currentDragOperation.sourceStageId,
        currentDragOperation.destinationStageId,
        currentDragOperation.destinationIndex,
        updatedOpportunity
      );
    }
    
    // Reset the state
    setCurrentDragOperation(null);
    setShowReasonDialog(false);
  };

  if (loading) {
    return <KanbanSkeleton />;
  }

  if (!funnel) {
    return (
      <div className="p-6 text-center">
        <p>Funil não encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <KanbanHeader 
          funnel={funnel}
          onNewStage={() => setIsCreateStageDialogOpen(true)}
        />
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <KanbanStages 
          stages={stages}
          funnelId={funnelId}
          onOpportunityCreated={onOpportunityCreated}
          onStageUpdated={onStageUpdated}
        />
      </DragDropContext>
      
      <CreateStageDialog 
        open={isCreateStageDialogOpen}
        onOpenChange={setIsCreateStageDialogOpen}
        funnelId={funnelId}
        onStageCreated={handleStageCreated}
      />
      
      {/* Dialog for required fields */}
      {currentDragOperation && showRequiredFieldsDialog && (
        <RequiredFieldsDialog
          open={showRequiredFieldsDialog}
          onOpenChange={(open) => {
            console.log('RequiredFieldsDialog onOpenChange:', open);
            setShowRequiredFieldsDialog(open);
            if (!open) {
              setCurrentDragOperation(null);
            }
          }}
          opportunity={currentDragOperation.opportunity}
          requiredFields={currentDragOperation.requiredFields}
          onComplete={handleRequiredFieldsComplete}
          stageId={currentDragOperation.destinationStageId}
        />
      )}
      
      {/* Dialog for win/loss reasons */}
      {currentDragOperation && showReasonDialog && (
        <OpportunityReasonDialog
          open={showReasonDialog}
          onOpenChange={(open) => {
            console.log('OpportunityReasonDialog onOpenChange:', open);
            setShowReasonDialog(open);
            if (!open) {
              setCurrentDragOperation(null);
            }
          }}
          opportunity={currentDragOperation.opportunity}
          needsWinReason={currentDragOperation.needsWinReason}
          needsLossReason={currentDragOperation.needsLossReason}
          availableWinReasons={currentDragOperation.availableWinReasons}
          availableLossReasons={currentDragOperation.availableLossReasons}
          onComplete={handleReasonComplete}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
