
import { useState } from "react";
import { RequiredField } from "@/types";

interface DragOperation {
  opportunity: any;
  sourceStageId: string;
  destinationStageId: string;
  destinationIndex: number;
  requiredFields: RequiredField[];
  needsWinReason?: boolean;
  needsLossReason?: boolean;
  availableWinReasons?: string[];
  availableLossReasons?: string[];
}

export const useKanbanDialogs = () => {
  const [isCreateStageDialogOpen, setIsCreateStageDialogOpen] = useState(false);
  const [showRequiredFieldsDialog, setShowRequiredFieldsDialog] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [currentDragOperation, setCurrentDragOperation] = useState<DragOperation | null>(null);

  const openCreateStageDialog = () => setIsCreateStageDialogOpen(true);
  const closeCreateStageDialog = () => setIsCreateStageDialogOpen(false);

  const setupDragOperation = (operation: DragOperation) => {
    console.log('setupDragOperation called with:', operation);
    setCurrentDragOperation(operation);
  };

  const handleShowRequiredFieldsDialog = (show: boolean) => {
    console.log('setShowRequiredFieldsDialog called with:', show);
    if (show && currentDragOperation) {
      const needsReasons = currentDragOperation.needsWinReason || currentDragOperation.needsLossReason;
      const hasRequiredFields = currentDragOperation.requiredFields?.length > 0;
      
      console.log('Dialog logic:', { needsReasons, hasRequiredFields });
      
      if (needsReasons && !hasRequiredFields) {
        console.log('Showing reason dialog directly');
        setShowReasonDialog(true);
      } else {
        console.log('Showing required fields dialog');
        setShowRequiredFieldsDialog(show);
      }
    } else {
      setShowRequiredFieldsDialog(show);
    }
  };

  const resetDialogs = () => {
    setCurrentDragOperation(null);
    setShowRequiredFieldsDialog(false);
    setShowReasonDialog(false);
  };

  return {
    isCreateStageDialogOpen,
    showRequiredFieldsDialog,
    showReasonDialog,
    currentDragOperation,
    openCreateStageDialog,
    closeCreateStageDialog,
    setupDragOperation,
    handleShowRequiredFieldsDialog,
    setShowReasonDialog,
    resetDialogs
  };
};
