
import { useState, useEffect } from "react";
import { DropResult } from "react-beautiful-dnd";
import { Funnel, Stage, Opportunity, RequiredField } from "@/types";
import { funnelAPI, stageAPI } from "@/services/api";
import { toast } from "sonner";
import KanbanSkeleton from "./KanbanSkeleton";
import KanbanHeader from "./KanbanHeader";
import KanbanStages from "./KanbanStages";
import CreateStageDialog from "../stage/CreateStageDialog";
import { triggerEntityWebhooks } from "@/services/utils/webhook";
import { useKanbanDragHandler } from "./KanbanDragHandler";
import { KanbanDragProvider } from "./KanbanDragContext";
import RequiredFieldsDialog from "../opportunity/RequiredFieldsDialog";
import { useConfetti } from "@/hooks/useConfetti";

interface KanbanBoardProps {
  funnelId: string;
}

const KanbanBoard = ({ funnelId }: KanbanBoardProps) => {
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateStageDialogOpen, setIsCreateStageDialogOpen] = useState(false);
  const { fireWinConfetti } = useConfetti();
  
  // State for the required fields dialog
  const [showRequiredFieldsDialog, setShowRequiredFieldsDialog] = useState(false);
  const [currentDragOperation, setCurrentDragOperation] = useState<{
    opportunity: Opportunity;
    sourceStageId: string;
    destinationStageId: string;
    destinationIndex: number;
    requiredFields: RequiredField[];
  } | null>(null);
  
  // Use the extracted drag handler logic
  const { handleDragEnd: originalHandleDragEnd, completeOpportunityMove } = useKanbanDragHandler({
    stages,
    funnelId,
    setStages,
    setShowRequiredFieldsDialog,
    setCurrentDragOperation
  });

  // Wrap the original drag handler to add confetti for win stages
  const handleDragEnd = (result: DropResult) => {
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const funnelData = await funnelAPI.getById(funnelId);
        const stagesData = await stageAPI.getByFunnelId(funnelId);
        
        // Sort stages by order property to ensure consistent order
        const sortedStages = [...stagesData].sort((a, b) => a.order - b.order);
        
        setFunnel(funnelData);
        setStages(sortedStages);
      } catch (error) {
        console.error("Error loading kanban data:", error);
        toast.error("Erro ao carregar dados do kanban.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [funnelId]);

  const handleStageCreated = (newStage: Stage) => {
    console.log("Stage created:", newStage);
    
    // Ensure the stage has all required properties
    if (!newStage.opportunities) {
      newStage.opportunities = [];
    }
    
    // Add the new stage to the existing stages
    setStages(prevStages => [...prevStages, newStage]);
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

  const handleOpportunityCreated = (newOpportunity: Opportunity) => {
    const updatedStages = stages.map(stage => {
      if (stage.id === newOpportunity.stageId) {
        return {
          ...stage,
          opportunities: [...stage.opportunities, newOpportunity]
        };
      }
      return stage;
    });
    
    setStages(updatedStages);
    
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

  const handleStageUpdated = (updatedStage: Stage) => {
    const updatedStages = stages.map(stage => 
      stage.id === updatedStage.id ? {...updatedStage, opportunities: stage.opportunities} : stage
    );
    setStages(updatedStages);
    
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
  
  const handleRequiredFieldsComplete = (success: boolean, updatedOpportunity?: Opportunity) => {
    if (success && currentDragOperation && updatedOpportunity) {
      // The dialog has successfully updated the opportunity with required fields
      // We need to update our local state to reflect the changes
      const { sourceStageId, destinationStageId, destinationIndex } = currentDragOperation;
      
      // Check if moving to a win stage and fire confetti
      const destinationStage = stages.find(stage => stage.id === destinationStageId);
      if (destinationStage?.isWinStage) {
        setTimeout(() => {
          fireWinConfetti();
          toast.success("🎉 Parabéns! Oportunidade fechada com sucesso!");
        }, 300);
      }
      
      // Optimistically update the UI (similar to what we do in completeOpportunityMove)
      const updatedStages = stages.map(stage => {
        // Remove from source stage
        if (stage.id === sourceStageId) {
          return {
            ...stage,
            opportunities: stage.opportunities.filter(
              opp => opp.id !== updatedOpportunity.id
            )
          };
        }
        // Add to destination stage
        if (stage.id === destinationStageId) {
          const newOpportunities = [...stage.opportunities];
          newOpportunities.splice(destinationIndex, 0, updatedOpportunity);
          return { ...stage, opportunities: newOpportunities };
        }
        return stage;
      });
      
      setStages(updatedStages);
    }
    
    // Reset the state
    setCurrentDragOperation(null);
  };

  if (loading) {
    return <KanbanSkeleton />;
  }

  if (!funnel) {
    return (
      <div className="p-4 text-center">
        <p>Funil não encontrado</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <KanbanHeader 
        funnel={funnel}
        onNewStage={() => setIsCreateStageDialogOpen(true)}
      />
      
      <KanbanDragProvider handleDragEnd={handleDragEnd} stages={stages}>
        <KanbanStages 
          stages={stages}
          funnelId={funnelId}
          onDragEnd={handleDragEnd}
          onOpportunityCreated={handleOpportunityCreated}
          onStageUpdated={handleStageUpdated}
        />
      </KanbanDragProvider>
      
      <CreateStageDialog 
        open={isCreateStageDialogOpen}
        onOpenChange={setIsCreateStageDialogOpen}
        funnelId={funnelId}
        onStageCreated={handleStageCreated}
      />
      
      {/* Dialog for required fields */}
      {currentDragOperation && (
        <RequiredFieldsDialog
          open={showRequiredFieldsDialog}
          onOpenChange={setShowRequiredFieldsDialog}
          opportunity={currentDragOperation.opportunity}
          requiredFields={currentDragOperation.requiredFields}
          onComplete={handleRequiredFieldsComplete}
          stageId={currentDragOperation.destinationStageId}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
