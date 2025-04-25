
import React from 'react';
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { Stage } from "@/types";
import StageColumn from "../stage/StageColumn";

interface KanbanStagesProps {
  stages: Stage[];
  funnelId: string;
  onDragEnd: (result: DropResult) => void;
  onOpportunityCreated: (opportunity: any) => void;
  onStageUpdated?: (stage: Stage) => void; // Nova prop para atualizar o estágio
}

const KanbanStages = ({ stages, funnelId, onDragEnd, onOpportunityCreated, onStageUpdated }: KanbanStagesProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
                onOpportunityCreated={onOpportunityCreated}
                onStageUpdated={onStageUpdated}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default KanbanStages;
