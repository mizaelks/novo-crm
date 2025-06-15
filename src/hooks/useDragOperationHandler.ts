
import { Stage, Opportunity, RequiredField } from "@/types";

interface DragOperation {
  opportunity: Opportunity;
  sourceStageId: string;
  destinationStageId: string;
  destinationIndex: number;
  requiredFields: RequiredField[];
  needsWinReason?: boolean;
  needsLossReason?: boolean;
  availableWinReasons?: string[];
  availableLossReasons?: string[];
}

export const useDragOperationHandler = () => {
  const createDragOperation = (
    opportunity: Opportunity,
    sourceStageId: string,
    destinationStage: Stage,
    destinationIndex: number
  ): DragOperation => {
    const requiredFields = destinationStage.requiredFields || [];
    const needsWinReason = destinationStage.isWinStage && destinationStage.winReasonRequired;
    const needsLossReason = destinationStage.isLossStage && destinationStage.lossReasonRequired;
    
    return {
      opportunity,
      sourceStageId,
      destinationStageId: destinationStage.id,
      destinationIndex,
      requiredFields,
      needsWinReason,
      needsLossReason,
      availableWinReasons: destinationStage.winReasons || [],
      availableLossReasons: destinationStage.lossReasons || []
    };
  };

  const hasRequirements = (operation: DragOperation): boolean => {
    const hasRequiredFields = operation.requiredFields.length > 0;
    const hasReasonRequirements = operation.needsWinReason || operation.needsLossReason;
    return hasRequiredFields || hasReasonRequirements;
  };

  const requiresOnlyReasons = (operation: DragOperation): boolean => {
    const hasRequiredFields = operation.requiredFields.length > 0;
    const hasReasonRequirements = operation.needsWinReason || operation.needsLossReason;
    return hasReasonRequirements && !hasRequiredFields;
  };

  return {
    createDragOperation,
    hasRequirements,
    requiresOnlyReasons
  };
};
