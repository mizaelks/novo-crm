
import { Droppable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Opportunity, Stage } from "@/types";
import OpportunityCard from "../opportunity/OpportunityCard";

interface StageOpportunityListProps {
  stageId: string;
  opportunities: Opportunity[];
  stage: Stage;
  onAddClick: () => void;
  onOpportunityClick: (opportunity: Opportunity) => void;
  onAddTask?: (opportunity: Opportunity) => void;
  onAddField?: (opportunity: Opportunity) => void;
}

const StageOpportunityList = ({
  stageId,
  opportunities,
  stage,
  onAddClick,
  onOpportunityClick,
  onAddTask,
  onAddField
}: StageOpportunityListProps) => {
  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddClick}
        className="w-full justify-start text-muted-foreground hover:text-foreground"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar oportunidade
      </Button>
      
      <Droppable droppableId={stageId} type="OPPORTUNITY">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[100px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-accent/50 rounded-lg' : ''
            }`}
          >
            {opportunities.map((opportunity, index) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                index={index}
                onClick={() => onOpportunityClick(opportunity)}
                onAddTask={onAddTask ? () => onAddTask(opportunity) : undefined}
                onAddField={onAddField ? () => onAddField(opportunity) : undefined}
                stageName={stage.name}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default StageOpportunityList;
