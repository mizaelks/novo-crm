
import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Stage, Opportunity } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import CreateOpportunityDialog from "../opportunity/CreateOpportunityDialog";
import StageHeader from "./StageHeader";
import StageOpportunityList from "./StageOpportunityList";

interface StageColumnProps {
  stage: Stage;
  index: number;
  funnelId: string;
  onOpportunityCreated: (opportunity: Opportunity) => void;
  onStageUpdated?: (stage: Stage) => void;
}

const StageColumn = ({ stage, index, funnelId, onOpportunityCreated, onStageUpdated }: StageColumnProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <Draggable draggableId={stage.id} index={index}>
      {(provided, snapshot) => {
        return (
          <div 
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="w-80 flex-shrink-0"
            style={{
              ...provided.draggableProps.style,
            }}
          >
            <Card className={`h-full flex flex-col ${snapshot.isDragging ? 'shadow-lg' : ''}`}>
              <StageHeader 
                stage={stage}
                dragHandleProps={provided.dragHandleProps}
                updateStage={onStageUpdated}
              />
              <CardContent className="p-2 flex-1 overflow-hidden">
                <StageOpportunityList
                  stageId={stage.id}
                  opportunities={stage.opportunities}
                  onAddClick={() => setIsDialogOpen(true)}
                />
              </CardContent>
            </Card>
            
            <CreateOpportunityDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              stageId={stage.id}
              funnelId={funnelId}
              onOpportunityCreated={onOpportunityCreated}
            />
          </div>
        );
      }}
    </Draggable>
  );
};

export default StageColumn;
