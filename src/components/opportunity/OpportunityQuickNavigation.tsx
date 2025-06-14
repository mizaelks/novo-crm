
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Stage } from "@/types";
import { useKanbanDrag } from "../kanban/KanbanDragContext";
import { toast } from "sonner";
import { useConfetti } from "@/hooks/useConfetti";
import { useOpportunityMove } from "@/hooks/useOpportunityMove";

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
  const { fireWinConfetti } = useConfetti();
  const { moveOpportunity, isMoving } = useOpportunityMove();
  
  // Find current stage index
  const currentStageIndex = stages.findIndex(stage => stage.id === currentStageId);
  const canMovePrevious = currentStageIndex > 0;
  const canMoveNext = currentStageIndex < stages.length - 1;
  
  const moveToStage = async (direction: 'previous' | 'next') => {
    if (isMoving) return;
    
    const targetIndex = direction === 'previous' ? currentStageIndex - 1 : currentStageIndex + 1;
    const targetStage = stages[targetIndex];
    
    if (!targetStage) return;
    
    // Find the current stage and opportunity
    const currentStage = stages[currentStageIndex];
    const opportunity = currentStage?.opportunities.find(opp => opp.id === opportunityId);
    
    if (!opportunity) return;
    
    // Check if moving to a win stage
    if (targetStage.isWinStage) {
      setTimeout(() => {
        fireWinConfetti();
        toast.success("🎉 Parabéns! Oportunidade fechada com sucesso!");
      }, 300);
    }
    
    await moveOpportunity(opportunity, targetStage.id, () => {
      onOpportunityMoved?.();
    });
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
          disabled={isMoving}
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
          disabled={isMoving}
          title={`Mover para ${stages[currentStageIndex + 1]?.name}`}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
