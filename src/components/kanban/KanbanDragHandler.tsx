
import { useState } from "react";
import { DropResult } from "react-beautiful-dnd";
import { Stage, Opportunity, RequiredField } from "@/types";
import { opportunityAPI, stageAPI } from "@/services/api";
import { toast } from "sonner";

interface UseKanbanDragHandlerProps {
  stages: Stage[];
  funnelId: string;
  setStages: (stages: Stage[]) => void;
  setShowRequiredFieldsDialog: (show: boolean) => void;
  setCurrentDragOperation: (operation: any) => void;
}

export const useKanbanDragHandler = ({
  stages,
  funnelId,
  setStages,
  setShowRequiredFieldsDialog,
  setCurrentDragOperation
}: UseKanbanDragHandlerProps) => {
  const [isDragging, setIsDragging] = useState(false);

  // Handle all drag end events
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // Check if we have a valid destination
    if (!destination) {
      return;
    }

    // Check if location didn't change
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    console.log(`Drag completed: ${type} from ${source.droppableId} to ${destination.droppableId}`);

    // Handle opportunity drag
    if (type === "opportunity") {
      handleOpportunityDrag(draggableId, source.droppableId, destination.droppableId, destination.index);
    }
    
    // Handle stage drag (reordering of stage columns)
    if (type === "stage") {
      handleStageDrag(draggableId, source.index, destination.index);
    }
  };

  // Handle stage drag (reorder stages)
  const handleStageDrag = async (stageId: string, sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    
    console.log(`Reordering stage ${stageId} from position ${sourceIndex} to ${destinationIndex}`);
    
    // Find the dragged stage
    const draggedStage = stages.find(stage => stage.id === stageId);
    if (!draggedStage) return;
    
    try {
      // Create a new array with the stages in the correct order
      const updatedStages = Array.from(stages);
      
      // Remove the dragged stage
      const [removedStage] = updatedStages.splice(sourceIndex, 1);
      
      // Insert it at the new position
      updatedStages.splice(destinationIndex, 0, removedStage);
      
      // Update the order property for each stage
      const reorderedStages = updatedStages.map((stage, index) => ({
        ...stage,
        order: index
      }));
      
      // Optimistically update UI
      setStages(reorderedStages);
      
      // Update the order in the database for each affected stage
      for (const stage of reorderedStages) {
        await stageAPI.update(stage.id, { order: stage.order });
      }
      
      toast.success("Etapas reordenadas com sucesso");
    } catch (error) {
      console.error("Error reordering stages:", error);
      toast.error("Erro ao reordenar etapas");
      // Refresh the stages from the server to ensure consistent state
      const refreshedStages = await stageAPI.getByFunnelId(funnelId);
      setStages(refreshedStages);
    }
  };

  // Handle opportunity drag
  const handleOpportunityDrag = (opportunityId: string, sourceStageId: string, destinationStageId: string, destinationIndex: number) => {
    // Find the dragged opportunity
    const sourceStage = stages.find(s => s.id === sourceStageId);
    if (!sourceStage) return;
    
    const opportunity = sourceStage.opportunities.find(o => o.id === opportunityId);
    if (!opportunity) return;
    
    // Check for required fields if moving to a different stage
    if (sourceStageId !== destinationStageId) {
      const destinationStage = stages.find(s => s.id === destinationStageId);
      if (!destinationStage) return;
      
      // Check if the destination stage has required fields
      if (destinationStage.requiredFields && destinationStage.requiredFields.length > 0) {
        // Check if all required fields are filled
        const requiredFieldsMissing = destinationStage.requiredFields.filter(field => {
          // For checkbox type, we consider it filled if it exists in customFields and is true
          if (field.type === "checkbox") {
            return opportunity.customFields?.[field.name] !== true;
          }
          
          // For other types, we check if the field exists and is not empty
          return !opportunity.customFields?.[field.name];
        });
        
        if (requiredFieldsMissing.length > 0) {
          console.log("Required fields missing:", requiredFieldsMissing);
          
          // Store the current drag operation and show the required fields dialog
          setCurrentDragOperation({
            opportunity,
            sourceStageId,
            destinationStageId,
            destinationIndex,
            requiredFields: requiredFieldsMissing
          });
          
          setShowRequiredFieldsDialog(true);
          return;
        }
      }
    }
    
    // Continue with the move if all required fields are filled or there are none
    completeOpportunityMove(opportunity, sourceStageId, destinationStageId, destinationIndex);
  };

  const completeOpportunityMove = async (
    opportunity: Opportunity,
    sourceStageId: string,
    destinationStageId: string,
    destinationIndex: number
  ) => {
    try {
      console.log(`Moving opportunity ${opportunity.id} from stage ${sourceStageId} to stage ${destinationStageId} at index ${destinationIndex}`);
      
      // Optimistically update UI
      const updatedStages = stages.map(stage => {
        // Remove from source stage
        if (stage.id === sourceStageId) {
          return {
            ...stage,
            opportunities: stage.opportunities.filter(
              opp => opp.id !== opportunity.id
            )
          };
        }
        
        // Add to destination stage
        if (stage.id === destinationStageId) {
          const newOpportunities = [...stage.opportunities];
          const updatedOpportunity = { ...opportunity, stageId: destinationStageId };
          newOpportunities.splice(destinationIndex, 0, updatedOpportunity);
          return { ...stage, opportunities: newOpportunities };
        }
        
        return stage;
      });
      
      setStages(updatedStages);
      
      // Save the change to the database
      await opportunityAPI.update(opportunity.id, { stageId: destinationStageId });
      
      toast.success("Oportunidade movida com sucesso");
    } catch (error) {
      console.error("Error moving opportunity:", error);
      toast.error("Erro ao mover oportunidade");
      
      // Refresh the stages from the server to ensure consistent state
      const refreshedStages = await stageAPI.getByFunnelId(funnelId);
      setStages(refreshedStages);
    }
  };

  return {
    handleDragEnd,
    completeOpportunityMove,
    isDragging
  };
};
