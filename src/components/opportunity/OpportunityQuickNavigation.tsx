
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Stage } from "@/types";
import { useKanbanDrag } from "../kanban/KanbanDragContext";
import { opportunityAPI } from "@/services/opportunityAPI";
import { toast } from "sonner";

interface OpportunityQuickNavigationProps {
  opportunityId: string;
  currentStageId: string;
  onOpportunityMoved?: () => void;
}

export const OpportunityQuickNavigation = ({ 
  opportunityId, 
  currentStageId, 
  onOpportunityMoved 
}: OpportunityQuickNavigationProps) => {
  const { stages } = useKanbanDrag();
  
  // Find current stage index
  const currentStageIndex = stages.findIndex(stage => stage.id === currentStageId);
  const canMovePrevious = currentStageIndex > 0;
  const canMoveNext = currentStageIndex < stages.length - 1;
  
  const moveToStage = async (direction: 'previous' | 'next') => {
    const targetIndex = direction === 'previous' ? currentStageIndex - 1 : currentStageIndex + 1;
    const targetStage = stages[targetIndex];
    
    if (!targetStage) return;
    
    // Find the current stage and opportunity
    const currentStage = stages[currentStageIndex];
    const opportunity = currentStage?.opportunities.find(opp => opp.id === opportunityId);
    
    if (!opportunity) return;
    
    try {
      // Simulate a drag operation to use the same logic
      const result = {
        destination: {
          droppableId: targetStage.id,
          index: targetStage.opportunities.length // Add to end of target stage
        },
        source: {
          droppableId: currentStageId,
          index: currentStage.opportunities.findIndex(opp => opp.id === opportunityId)
        },
        draggableId: opportunityId,
        type: "opportunity",
        reason: "DROP" as const
      };
      
      // Use the same drag handler logic from the context
      const { handleDragEnd } = useKanbanDrag();
      
      // This will handle the optimistic UI update and API call
      await handleDragEnd(result);
      
      onOpportunityMoved?.();
      toast.success(`Oportunidade movida para ${targetStage.name}`);
    } catch (error) {
      console.error("Error moving opportunity:", error);
      toast.error("Erro ao mover oportunidade");
    }
  };
  
  if (!canMovePrevious && !canMoveNext) {
    return null;
  }
  
  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {canMovePrevious && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            moveToStage('previous');
          }}
          title={`Mover para ${stages[currentStageIndex - 1]?.name}`}
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
      )}
      
      {canMoveNext && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            moveToStage('next');
          }}
          title={`Mover para ${stages[currentStageIndex + 1]?.name}`}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
