
import { Droppable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Opportunity } from "@/types";
import OpportunityCard from "../opportunity/OpportunityCard";

interface StageOpportunityListProps {
  stageId: string;
  opportunities: Opportunity[];
  onAddClick: () => void;
}

const StageOpportunityList = ({ stageId, opportunities, onAddClick }: StageOpportunityListProps) => {
  return (
    <Droppable droppableId={stageId} type="opportunity">
      {(provided, snapshot) => (
        <div
          className={`min-h-[150px] h-full p-1 rounded-sm ${
            snapshot.isDraggingOver ? "bg-accent/70" : ""
          }`}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {opportunities.map((opportunity, index) => (
            <OpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
              index={index}
              stageId={stageId}
            />
          ))}
          {provided.placeholder}
          <Button
            variant="ghost"
            className="w-full mt-2 text-muted-foreground border border-dashed border-muted-foreground/30"
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
