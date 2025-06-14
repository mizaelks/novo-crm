
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

    // Check if we have a valid destination
    if (!destination) {
      return;
    }

    // Check if location didn't change
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    console.log(`Drag completed: ${type} from ${source.droppableId} to ${destination.droppableId}`);

    // Handle opportunity drag
    if (type === "opportunity") {
      handleOpportunityDrag(draggableId, source.droppableId, destination.droppableId, destination.index);
    }
    
    // Handle stage drag (reordering of stage columns)
    if (type === "stage") {
      handleStageDrag(draggableId, source.index, destination.index);
    }
  };

  return {
    handleDragEnd,
    completeOpportunityMove,
    isDragging
  };
};
