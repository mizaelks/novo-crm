
import { Opportunity, Stage } from "@/types";
import { DropResult } from "react-beautiful-dnd";
import { toast } from "sonner";
import { opportunityAPI, stageAPI } from "@/services/api";
import { triggerEntityWebhooks } from "@/services/utils/webhook";

interface UseDragHandlerProps {
  stages: Stage[];
  funnelId: string;
  setStages: (stages: Stage[]) => void;
}

export const useKanbanDragHandler = ({ stages, funnelId, setStages }: UseDragHandlerProps) => {
  // Check if opportunity meets required fields for a stage
  const checkRequiredFields = (opportunity: Opportunity, stageId: string): { valid: boolean, missingFields: string[] } => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage || !stage.requiredFields || stage.requiredFields.length === 0) {
      return { valid: true, missingFields: [] };
    }
    
    const missingFields: string[] = [];
    
    for (const field of stage.requiredFields) {
      if (!field.isRequired) continue;
      
      const fieldValue = opportunity.customFields?.[field.name];
      
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        missingFields.push(field.name);
      } else if (field.type === 'checkbox' && fieldValue !== true) {
        missingFields.push(field.name);
      }
    }
    
    return { 
      valid: missingFields.length === 0,
      missingFields
    };
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "opportunity") {
      // Handle opportunity movement
      const opportunityId = draggableId;
      const sourceStageId = source.droppableId;
      const destinationStageId = destination.droppableId;
      
      try {
        // Find the opportunity
        const sourceStage = stages.find(stage => stage.id === sourceStageId);
        if (!sourceStage) return;
        
        const opportunity = sourceStage.opportunities.find(opp => opp.id === opportunityId);
        if (!opportunity) return;
        
        // Check if the opportunity meets the required fields for the destination stage
        const { valid, missingFields } = checkRequiredFields(opportunity, destinationStageId);
        
        if (!valid) {
          toast.error(
            `Não é possível mover esta oportunidade para a etapa selecionada. Campos obrigatórios faltando: ${missingFields.join(', ')}`
          );
          return;
        }
        
        // Optimistically update the UI
        const updatedStages = stages.map(stage => {
          // If this is the source stage, remove the opportunity
          if (stage.id === sourceStageId) {
            const opportunityIndex = stage.opportunities.findIndex(opp => opp.id === opportunityId);
            if (opportunityIndex !== -1) {
              const newOpportunities = [...stage.opportunities];
              newOpportunities.splice(opportunityIndex, 1);
              return { ...stage, opportunities: newOpportunities };
            }
          }
          return stage;
        });
        
        // Make a copy of the opportunity with its updated stageId, preserving all existing fields
        const updatedOpportunity = { 
          ...opportunity, 
          stageId: destinationStageId,
          // Explicitly ensure the customFields are preserved
          customFields: { ...(opportunity.customFields || {}) }
        };
        
        // Add the opportunity to the destination stage
        const finalStages = updatedStages.map(stage => {
          if (stage.id === destinationStageId) {
            const newOpportunities = [...stage.opportunities];
            newOpportunities.splice(destination.index, 0, updatedOpportunity);
            return { ...stage, opportunities: newOpportunities };
          }
          return stage;
        });
        
        setStages(finalStages);
        
        // Send the update to the API
        const movedOpportunity = await opportunityAPI.move(opportunityId, destinationStageId);
        
        if (!movedOpportunity) {
          console.error("Failed to move opportunity");
          toast.error("Erro ao mover oportunidade. Por favor, tente novamente.");
          
          // Revert back to original state on API error
          const originalStages = await stageAPI.getByFunnelId(funnelId);
          setStages(originalStages);
          return;
        }
        
        console.log("Moved opportunity from API:", movedOpportunity);
        
        // Try to trigger the webhook, but don't let it break the move if it fails
        try {
          // Fix: Handle wildcard correctly - don't pass it directly to SQL query
          // Instead, use specific opportunity ID for trigger but fetch general webhooks in the webhook service
          const webhookResponse = await triggerEntityWebhooks(
            'opportunity', 
            opportunityId, // Always use the actual ID, not wildcard
            'move',
            {
              id: opportunityId,
              title: updatedOpportunity.title,
              client: updatedOpportunity.client,
              value: updatedOpportunity.value,
              previousStageId: sourceStageId,
              newStageId: destinationStageId,
              funnelId: funnelId,
              customFields: updatedOpportunity.customFields
            }
          );
          
          console.log("Webhook dispatch result:", webhookResponse);
          
          // Show toast for successful move
          if (webhookResponse.dispatched > 0) {
            toast.success(
              `Oportunidade movida com sucesso. ${webhookResponse.success}/${webhookResponse.dispatched} webhooks notificados.`
            );
          } else {
            toast.success("Oportunidade movida com sucesso.");
          }
        } catch (webhookError) {
          console.error("Error with webhooks, but move was successful:", webhookError);
          toast.success("Oportunidade movida com sucesso.");
        }
        
      } catch (error) {
        console.error("Error moving opportunity:", error);
        toast.error("Erro ao mover oportunidade.");
        
        // Revert back to original state on error
        const originalStages = await stageAPI.getByFunnelId(funnelId);
        setStages(originalStages);
      }
    }

    // Handle stage reordering if needed
    if (type === "stage") {
      console.log("Stage reordering not implemented yet");
      // You could implement stage reordering here if needed
    }
  };

  return { handleDragEnd };
};
