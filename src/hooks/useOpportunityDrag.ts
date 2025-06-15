
import { useState } from "react";
import { opportunityAPI } from "@/services/api";
import { Stage, Opportunity } from "@/types";
import { toast } from "sonner";
import { useDragOperationHandler } from "./useDragOperationHandler";

export const useOpportunityDrag = (
  stages: Stage[],
  funnelId: string,
  setStages: (stages: Stage[]) => void,
  setShowRequiredFieldsDialog: (show: boolean | string) => void,
  setCurrentDragOperation: (operation: any) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const { createDragOperation, hasRequirements, requiresOnlyReasons } = useDragOperationHandler();

  const handleOpportunityDrag = async (
    draggableId: string,
    sourceDroppableId: string,
    destinationDroppableId: string,
    destinationIndex: number
  ) => {
    console.log(`Moving opportunity ${draggableId} from ${sourceDroppableId} to ${destinationDroppableId}`);
    
    const opportunityId = draggableId;
    
    // Find source and destination stages
    const sourceStage = stages.find(stage => stage.id === sourceDroppableId);
    const destinationStage = stages.find(stage => stage.id === destinationDroppableId);
    
    if (!sourceStage || !destinationStage) {
      console.error("Could not find source or destination stage");
      toast.error("Erro ao mover oportunidade");
      return;
    }
    
    // Find the opportunity being moved
    const opportunity = sourceStage.opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) {
      console.error("Could not find opportunity:", opportunityId);
      toast.error("Oportunidade não encontrada");
      return;
    }
    
    // Create drag operation
    const dragOperation = createDragOperation(
      opportunity,
      sourceDroppableId,
      destinationStage,
      destinationIndex
    );
    
    console.log('Drag operation created:', dragOperation);
    console.log('Destination stage details:', {
      id: destinationStage.id,
      name: destinationStage.name,
      isWinStage: destinationStage.isWinStage,
      isLossStage: destinationStage.isLossStage,
      winReasonRequired: destinationStage.winReasonRequired,
      lossReasonRequired: destinationStage.lossReasonRequired,
      requiredFields: destinationStage.requiredFields
    });
    
    if (hasRequirements(dragOperation)) {
      console.log('Has requirements - setting up drag operation');
      setCurrentDragOperation(dragOperation);
      
      // Se só precisa de motivos, vai direto para diálogo de motivos
      if (requiresOnlyReasons(dragOperation)) {
        console.log('Only needs reasons - showing reason dialog directly');
        // Sinaliza que deve mostrar diálogo de motivos
        setShowRequiredFieldsDialog('reason');
        return;
      }
      
      console.log('Has required fields - showing required fields dialog');
      setShowRequiredFieldsDialog(true);
      return;
    }
    
    console.log('No requirements, proceeding with direct move');
    await completeOpportunityMove(opportunity, sourceDroppableId, destinationDroppableId, destinationIndex);
  };

  const completeOpportunityMove = async (
    opportunity: Opportunity,
    sourceStageId: string,
    destinationStageId: string,
    destinationIndex: number,
    updatedOpportunity?: Partial<Opportunity>
  ) => {
    console.log('Starting completeOpportunityMove:', { opportunityId: opportunity.id, sourceStageId, destinationStageId });
    setIsDragging(true);
    
    try {
      // Merge any updates (like win/loss reasons) with the opportunity
      const opportunityToMove = updatedOpportunity ? { ...opportunity, ...updatedOpportunity } : opportunity;
      
      // Optimistically update UI first
      const updatedStages = stages.map(stage => {
        // Remove from source stage
        if (stage.id === sourceStageId) {
          return {
            ...stage,
            opportunities: stage.opportunities.filter(opp => opp.id !== opportunity.id)
          };
        }
        
        // Add to destination stage
        if (stage.id === destinationStageId) {
          const newOpportunities = [...stage.opportunities];
          const updatedOpp = {
            ...opportunityToMove,
            stageId: destinationStageId,
            lastStageChangeAt: new Date()
          };
          newOpportunities.splice(destinationIndex, 0, updatedOpp);
          return { ...stage, opportunities: newOpportunities };
        }
        
        return stage;
      });
      
      console.log('Updating UI optimistically');
      setStages(updatedStages);
      
      // Then update the database with any reason updates
      if (updatedOpportunity) {
        console.log('Updating opportunity with additional data:', updatedOpportunity);
        await opportunityAPI.update(opportunity.id, {
          stageId: destinationStageId,
          ...updatedOpportunity
        });
      } else {
        console.log('Moving opportunity via API');
        await opportunityAPI.move(opportunity.id, destinationStageId);
      }
      
      console.log('Move completed successfully');
      toast.success("Oportunidade movida com sucesso");
    } catch (error) {
      console.error("Error moving opportunity:", error);
      toast.error("Erro ao mover oportunidade");
    } finally {
      setIsDragging(false);
    }
  };

  return {
    handleOpportunityDrag,
    completeOpportunityMove,
    isDragging
  };
};
