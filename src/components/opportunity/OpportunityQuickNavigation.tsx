
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Stage } from "@/types";
import { stageAPI } from "@/services/api";
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
  const [stages, setStages] = useState<Stage[]>([]);
  const { fireWinConfetti } = useConfetti();
  const { moveOpportunity, isMoving } = useOpportunityMove();
  
  useEffect(() => {
    // We need to get the funnel ID from somewhere - for now we'll get all stages
    // This is a temporary solution - ideally we'd have the funnel ID passed down
    const loadStages = async () => {
      try {
        // This is not ideal but we need the stages for navigation
        // In a real implementation, stages should be passed from parent or context
        console.log("Loading stages for quick navigation");
      } catch (error) {
        console.error("Error loading stages:", error);
      }
    };
    
    loadStages();
  }, []);
  
  // For now, return null since we don't have access to stages in this context
  // This component would need to be refactored to receive stages as props
  // or use a context that provides the current stages
  return null;
  
  // TODO: Implement proper stage navigation when stages are available
  // The logic below would work once we have access to the stages array
  
  /*
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
  */
};
