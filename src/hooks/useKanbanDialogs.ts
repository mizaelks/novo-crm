
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

  const handleShowRequiredFieldsDialog = (show: boolean | string) => {
    console.log('handleShowRequiredFieldsDialog called with:', show);
    
    if (show === 'reason') {
      // Vai direto para o diálogo de motivos
      console.log('Going directly to reason dialog');
      setShowReasonDialog(true);
      return;
    }
    
    if (show && currentDragOperation) {
      const needsReasons = currentDragOperation.needsWinReason || currentDragOperation.needsLossReason;
      const hasRequiredFields = currentDragOperation.requiredFields?.length > 0;
      
      console.log('Dialog logic:', { needsReasons, hasRequiredFields, requiredFields: currentDragOperation.requiredFields });
      
      // Se só precisa de motivos (sem campos obrigatórios), vai direto para o diálogo de motivos
      if (needsReasons && !hasRequiredFields) {
        console.log('Showing reason dialog directly - no required fields');
        setShowReasonDialog(true);
        return;
      }
      
      // Se tem campos obrigatórios, mostra o diálogo de campos primeiro
      if (hasRequiredFields) {
        console.log('Showing required fields dialog');
        setShowRequiredFieldsDialog(true);
        return;
      }
      
      // Se não tem nem campos obrigatórios nem motivos, algo está errado
      console.log('No requirements found, this should not happen');
    } else {
      setShowRequiredFieldsDialog(show as boolean);
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
