
import { Stage, Opportunity, RequiredField } from "@/types";
import { requiredElementsService } from "@/services/requiredElementsService";

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
  const createDragOperation = async (
    opportunity: Opportunity,
    sourceStageId: string,
    destinationStage: Stage,
    destinationIndex: number
  ): Promise<DragOperation> => {
    // Buscar requisitos da etapa de destino
    const { requiredFields } = await requiredElementsService.getStageRequirements(destinationStage.id);
    
    const needsWinReason = destinationStage.isWinStage && destinationStage.winReasonRequired;
    const needsLossReason = destinationStage.isLossStage && destinationStage.lossReasonRequired;
    
    console.log('Creating drag operation:', {
      destinationStageId: destinationStage.id,
      isWinStage: destinationStage.isWinStage,
      isLossStage: destinationStage.isLossStage,
      winReasonRequired: destinationStage.winReasonRequired,
      lossReasonRequired: destinationStage.lossReasonRequired,
      needsWinReason,
      needsLossReason,
      requiredFieldsCount: requiredFields.length
    });
    
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
    
    console.log('Checking requirements:', {
      hasRequiredFields,
      hasReasonRequirements,
      totalRequirements: hasRequiredFields || hasReasonRequirements
    });
    
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
