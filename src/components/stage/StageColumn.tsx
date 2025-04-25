
import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { Stage, Opportunity } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import CreateOpportunityDialog from "../opportunity/CreateOpportunityDialog";
import StageHeader from "./StageHeader";
import StageOpportunityList from "./StageOpportunityList";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StageColumnProps {
  stage: Stage;
  index: number;
  funnelId: string;
  onOpportunityCreated: (opportunity: Opportunity) => void;
  onStageUpdated?: (stage: Stage) => void; // Nova prop para atualizar o estágio
}

const StageColumn = ({ stage, index, funnelId, onOpportunityCreated, onStageUpdated }: StageColumnProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <Draggable draggableId={`stage-${stage.id}`} index={index}>
      {(provided) => (
        <div 
          className="w-80 flex-shrink-0"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <Card className="h-full flex flex-col">
            <StageHeader 
              stage={stage}
              dragHandleProps={provided.dragHandleProps}
              updateStage={onStageUpdated}
            />
            <CardContent className="p-2 flex-1">
              <ScrollArea className="h-[calc(100vh-260px)]">
                <StageOpportunityList
                  stageId={stage.id}
                  opportunities={stage.opportunities}
                  onAddClick={() => setIsDialogOpen(true)}
                />
              </ScrollArea>
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
      )}
    </Draggable>
  );
};

export default StageColumn;
