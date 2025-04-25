import { useState, useEffect } from "react";
import { DropResult } from "react-beautiful-dnd";
import { Funnel, Stage, Opportunity } from "@/types";
import { funnelAPI, stageAPI, opportunityAPI } from "@/services/api";
import { toast } from "sonner";
import KanbanSkeleton from "./KanbanSkeleton";
import KanbanHeader from "./KanbanHeader";
import KanbanStages from "./KanbanStages";
import CreateStageDialog from "../stage/CreateStageDialog";
import { triggerEntityWebhooks } from "@/services/utils/webhook";

interface KanbanBoardProps {
  funnelId: string;
}

const KanbanBoard = ({ funnelId }: KanbanBoardProps) => {
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateStageDialogOpen, setIsCreateStageDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const funnelData = await funnelAPI.getById(funnelId);
        const stagesData = await stageAPI.getByFunnelId(funnelId);
        setFunnel(funnelData);
        setStages(stagesData);
      } catch (error) {
        console.error("Error loading kanban data:", error);
        toast.error("Erro ao carregar dados do kanban.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [funnelId]);

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
        // Optimistically update the UI
        const updatedStages = stages.map(stage => {
          // If this is the source stage, remove the opportunity
          if (stage.id === sourceStageId) {
            const opportunityIndex = stage.opportunities.findIndex(opp => opp.id === opportunityId);
            if (opportunityIndex !== -1) {
              const opportunity = stage.opportunities[opportunityIndex];
              const newOpportunities = [...stage.opportunities];
              newOpportunities.splice(opportunityIndex, 1);
              return { ...stage, opportunities: newOpportunities };
            }
          }
          return stage;
        });
        
        // Find the opportunity from the source stage
        const sourceStage = stages.find(stage => stage.id === sourceStageId);
        if (!sourceStage) return;
        
        const opportunity = sourceStage.opportunities.find(opp => opp.id === opportunityId);
        if (!opportunity) return;
        
        // Update the opportunity with the new stageId
        const updatedOpportunity = { ...opportunity, stageId: destinationStageId };
        
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
        await opportunityAPI.move(opportunityId, destinationStageId);
        
        // Trigger move webhook for opportunity
        const webhookResponse = await triggerEntityWebhooks(
          'opportunity', 
          opportunityId, 
          'move',
          {
            id: opportunityId,
            title: updatedOpportunity.title,
            client: updatedOpportunity.client,
            value: updatedOpportunity.value,
            previousStageId: sourceStageId,
            newStageId: destinationStageId,
            funnelId: funnelId
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
        
      } catch (error) {
        console.error("Error moving opportunity:", error);
        toast.error("Erro ao mover oportunidade.");
        
        // Revert back to original state on error
        const originalStages = await stageAPI.getByFunnelId(funnelId);
        setStages(originalStages);
      }
    }
  };

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
      
      <KanbanStages 
        stages={stages}
        funnelId={funnelId}
        onDragEnd={handleDragEnd}
        onOpportunityCreated={handleOpportunityCreated}
        onStageUpdated={handleStageUpdated}
      />
      
      <CreateStageDialog 
        open={isCreateStageDialogOpen}
        onOpenChange={setIsCreateStageDialogOpen}
        funnelId={funnelId}
        onStageCreated={handleStageCreated}
      />
    </div>
  );
};

export default KanbanBoard;
