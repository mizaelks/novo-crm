
import { useState } from "react";
import { DropResult } from "react-beautiful-dnd";
import { Stage } from "@/types";
import { useStageDrag } from "./useStageDrag";
import { useOpportunityDrag } from "./useOpportunityDrag";

interface UseKanbanDragHandlerProps {
  stages: Stage[];
  funnelId: string;
  setStages: (stages: Stage[]) => void;
  setShowRequiredFieldsDialog: (show: boolean) => void;
  setCurrentDragOperation: (operation: any) => void;
}

export const useKanbanDragHandler = ({
  stages,
  funnelId,
  setStages,
  setShowRequiredFieldsDialog,
  setCurrentDragOperation
}: UseKanbanDragHandlerProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const { handleStageDrag } = useStageDrag(stages, funnelId, setStages);
  const { handleOpportunityDrag, completeOpportunityMove } = useOpportunityDrag(
    stages,
    funnelId,
    setStages,
    setShowRequiredFieldsDialog,
    setCurrentDragOperation
  );

  // Handle all drag end events
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    console.log("Drag result:", { destination, source, draggableId, type });

    // Check if we have a valid destination
    if (!destination) {
      console.log("No destination, drag cancelled");
      return;
    }

    // Check if location didn't change
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log("Same position, no change needed");
      return;
    }

    console.log(`Drag completed: ${type} from ${source.droppableId}[${source.index}] to ${destination.droppableId}[${destination.index}]`);

    // Handle opportunity drag between stages
    if (type === "OPPORTUNITY") {
      console.log("Handling opportunity drag");
      await handleOpportunityDrag(draggableId, source.droppableId, destination.droppableId, destination.index);
    }
    
    // Handle stage reordering
    if (type === "STAGE") {
      console.log("Handling stage reordering");
      await handleStageDrag(draggableId, source.index, destination.index);
    }

    // Handle default type (for backward compatibility)
    if (!type || type === "DEFAULT") {
      console.log("Handling default drag type as opportunity");
      await handleOpportunityDrag(draggableId, source.droppableId, destination.droppableId, destination.index);
    }
  };

  return {
    handleDragEnd,
    completeOpportunityMove,
    isDragging
  };
};
