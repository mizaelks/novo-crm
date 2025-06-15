
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { toast } from "sonner";
import KanbanSkeleton from "./KanbanSkeleton";
import KanbanHeader from "./KanbanHeader";
import KanbanStages from "./KanbanStages";
import KanbanDialogs from "./KanbanDialogs";
import { useKanbanDragHandler } from "../../hooks/useKanbanDragHandler";
import { useConfetti } from "@/hooks/useConfetti";
import { useKanbanState } from "../../hooks/useKanbanState";
import { useKanbanDialogs } from "../../hooks/useKanbanDialogs";
import { useKanbanHandlers } from "../../hooks/useKanbanHandlers";

interface KanbanBoardProps {
  funnelId: string;
}

const KanbanBoard = ({ funnelId }: KanbanBoardProps) => {
  const { fireWinConfetti } = useConfetti();
  
  // Use the kanban state hook
  const {
    funnel,
    stages,
    loading,
    setStages,
    handleStageCreated: onStageCreated,
    handleOpportunityCreated,
    handleStageUpdated
  } = useKanbanState(funnelId);

  // Use the dialogs hook
  const {
    isCreateStageDialogOpen,
    showRequiredFieldsDialog,
    showReasonDialog,
    currentDragOperation,
    openCreateStageDialog,
    closeCreateStageDialog,
    setupDragOperation,
    handleShowRequiredFieldsDialog,
    setShowReasonDialog,
    resetDialogs
  } = useKanbanDialogs();
  
  // Use the extracted drag handler logic
  const { handleDragEnd: originalHandleDragEnd, completeOpportunityMove } = useKanbanDragHandler({
    stages,
    funnelId,
    setStages,
    setShowRequiredFieldsDialog: handleShowRequiredFieldsDialog,
    setCurrentDragOperation: setupDragOperation
  });

  // Use the handlers hook
  const {
    handleStageCreated,
    handleOpportunityCreated: onOpportunityCreated,
    handleStageUpdated: onStageUpdated,
    handleRequiredFieldsComplete,
    handleReasonComplete
  } = useKanbanHandlers({
    funnelId,
    stages,
    onStageCreated,
    onOpportunityCreated: handleOpportunityCreated,
    onStageUpdated: handleStageUpdated,
    completeOpportunityMove,
    resetDialogs,
    setShowReasonDialog
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
          onNewStage={openCreateStageDialog}
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
      
      <KanbanDialogs
        isCreateStageDialogOpen={isCreateStageDialogOpen}
        onCreateStageDialogChange={closeCreateStageDialog}
        funnelId={funnelId}
        onStageCreated={handleStageCreated}
        showRequiredFieldsDialog={showRequiredFieldsDialog}
        onRequiredFieldsDialogChange={handleShowRequiredFieldsDialog}
        showReasonDialog={showReasonDialog}
        onReasonDialogChange={setShowReasonDialog}
        currentDragOperation={currentDragOperation}
        onRequiredFieldsComplete={(success, updatedOpportunity) => 
          handleRequiredFieldsComplete(success, updatedOpportunity, currentDragOperation)
        }
        onReasonComplete={(success, updatedOpportunity) => 
          handleReasonComplete(success, updatedOpportunity, currentDragOperation)
        }
        onResetOperation={resetDialogs}
      />
    </div>
  );
};

export default KanbanBoard;
