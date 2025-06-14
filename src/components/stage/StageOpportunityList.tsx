
import { Droppable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Opportunity, Stage } from "@/types";
import OpportunityCard from "../opportunity/OpportunityCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StageOpportunityListProps {
  stageId: string;
  opportunities: Opportunity[];
  stage: Stage;
  onAddClick: () => void;
  onOpportunityClick?: (opportunity: Opportunity) => void;
}

const StageOpportunityList = ({ 
  stageId, 
  opportunities, 
  stage, 
  onAddClick, 
  onOpportunityClick 
}: StageOpportunityListProps) => {
  // Garantir que opportunities seja sempre um array válido
  const validOpportunities = Array.isArray(opportunities) ? opportunities : [];
  
  return (
    <Droppable droppableId={stageId} type="OPPORTUNITY">
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
                  stage={stage}
                  onClick={onOpportunityClick}
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
