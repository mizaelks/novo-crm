
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { Funnel, Opportunity, Stage } from "@/types";
import { funnelAPI, stageAPI, opportunityAPI } from "@/services/api";
import StageColumn from "../stage/StageColumn";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateStageDialog from "../stage/CreateStageDialog";
import { toast } from "sonner";

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
      const newStageId = destination.droppableId;
      
      try {
        // Optimistically update the UI
        const updatedStages = stages.map(stage => {
          // If this is the source stage, remove the opportunity
          if (stage.id === source.droppableId) {
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
        const sourceStage = stages.find(stage => stage.id === source.droppableId);
        if (!sourceStage) return;
        
        const opportunity = sourceStage.opportunities.find(opp => opp.id === opportunityId);
        if (!opportunity) return;
        
        // Update the opportunity with the new stageId
        const updatedOpportunity = { ...opportunity, stageId: newStageId };
        
        // Add the opportunity to the destination stage
        const finalStages = updatedStages.map(stage => {
          if (stage.id === newStageId) {
            const newOpportunities = [...stage.opportunities];
            newOpportunities.splice(destination.index, 0, updatedOpportunity);
            return { ...stage, opportunities: newOpportunities };
          }
          return stage;
        });
        
        setStages(finalStages);
        
        // Send the update to the API
        await opportunityAPI.move(opportunityId, newStageId);
        
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
    setStages([...stages, newStage]);
    setIsCreateStageDialogOpen(false);
  };

  const handleOpportunityCreated = (newOpportunity: Opportunity) => {
    // Update the stages with the new opportunity
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
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="h-6 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="flex space-x-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-80 h-96 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{funnel.name}</h2>
          <p className="text-muted-foreground">{funnel.description}</p>
        </div>
        <Button onClick={() => setIsCreateStageDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Etapa
        </Button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-stages" direction="horizontal" type="stage">
          {(provided) => (
            <div 
              className="flex space-x-4 overflow-x-auto pb-4"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {stages.map((stage, index) => (
                <StageColumn 
                  key={stage.id} 
                  stage={stage} 
                  index={index} 
                  funnelId={funnelId}
                  onOpportunityCreated={handleOpportunityCreated}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
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
