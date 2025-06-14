
import { Droppable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Opportunity } from "@/types";
import OpportunityCard from "../opportunity/OpportunityCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StageOpportunityListProps {
  stageId: string;
  opportunities: Opportunity[];
  onAddClick: () => void;
}

const StageOpportunityList = ({ stageId, opportunities, onAddClick }: StageOpportunityListProps) => {
  // Garantir que opportunities seja sempre um array válido
  const validOpportunities = Array.isArray(opportunities) ? opportunities : [];
  
  // Handler functions for opportunity updates and deletions
  const handleOpportunityUpdated = (updatedOpportunity: Opportunity) => {
    console.log("Opportunity updated:", updatedOpportunity.id);
    // A atualização real é gerenciada pelo contexto do Kanban
  };
  
  const handleOpportunityDeleted = (opportunityId: string) => {
    console.log("Opportunity deleted:", opportunityId);
    // A exclusão real é gerenciada pelo contexto do Kanban
  };
  
  return (
    <Droppable droppableId={stageId} type="opportunity">
      {(provided, snapshot) => (
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 h-[calc(100vh-280px)]">
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[50px] p-1 rounded-sm ${
                snapshot.isDraggingOver ? "bg-accent/70" : ""
              }`}
            >
              {validOpportunities.map((opportunity, index) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  index={index}
                  onOpportunityUpdated={handleOpportunityUpdated}
                  onOpportunityDeleted={handleOpportunityDeleted}
                />
              ))}
              {provided.placeholder}
            </div>
          </ScrollArea>
          <Button
            variant="ghost"
            className="w-full mt-4 text-muted-foreground border border-dashed border-muted-foreground/30"
            onClick={onAddClick}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      )}
    </Droppable>
  );
};

export default StageOpportunityList;
