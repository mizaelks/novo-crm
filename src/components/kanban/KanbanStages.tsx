
import React from 'react';
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { Stage } from "@/types";
import StageColumn from "../stage/StageColumn";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanStagesProps {
  stages: Stage[];
  funnelId: string;
  onDragEnd: (result: DropResult) => void;
  onOpportunityCreated: (opportunity: any) => void;
  onStageUpdated?: (stage: Stage) => void;
}

const KanbanStages = ({ stages, funnelId, onDragEnd, onOpportunityCreated, onStageUpdated }: KanbanStagesProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <ScrollArea className="w-full" orientation="horizontal">
        <div className="w-full overflow-visible pb-6 pt-2">
          <Droppable droppableId="all-stages" direction="horizontal" type="stage">
            {(provided) => (
              <div 
                className="flex space-x-4 min-w-full pb-2"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {stages.map((stage, index) => (
                  <StageColumn 
                    key={stage.id}
                    stage={stage} 
                    index={index} 
                    funnelId={funnelId}
                    onOpportunityCreated={onOpportunityCreated}
                    onStageUpdated={onStageUpdated}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </ScrollArea>
    </DragDropContext>
  );
};

export default KanbanStages;
