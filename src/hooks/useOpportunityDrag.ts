
import { opportunityAPI, stageAPI } from "@/services/api";
import { Stage, Opportunity } from "@/types";
import { toast } from "sonner";

export const useOpportunityDrag = (
  stages: Stage[],
  funnelId: string,
  setStages: (stages: Stage[]) => void,
  setShowRequiredFieldsDialog: (show: boolean) => void,
  setCurrentDragOperation: (operation: any) => void
) => {
  const handleOpportunityDrag = (
    opportunityId: string, 
    sourceStageId: string, 
    destinationStageId: string, 
    destinationIndex: number
  ) => {
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

  return { handleOpportunityDrag, completeOpportunityMove };
};
