
import CreateStageDialog from "../stage/CreateStageDialog";
import RequiredFieldsDialog from "../opportunity/RequiredFieldsDialog";
import OpportunityReasonDialog from "../opportunity/OpportunityReasonDialog";

interface KanbanDialogsProps {
  isCreateStageDialogOpen: boolean;
  onCreateStageDialogChange: (open: boolean) => void;
  funnelId: string;
  onStageCreated: (stage: any) => void;
  showRequiredFieldsDialog: boolean;
  onRequiredFieldsDialogChange: (open: boolean) => void;
  showReasonDialog: boolean;
  onReasonDialogChange: (open: boolean) => void;
  currentDragOperation: any;
  onRequiredFieldsComplete: (success: boolean, updatedOpportunity?: any) => void;
  onReasonComplete: (success: boolean, updatedOpportunity?: any) => void;
  onResetOperation: () => void;
}

const KanbanDialogs = ({
  isCreateStageDialogOpen,
  onCreateStageDialogChange,
  funnelId,
  onStageCreated,
  showRequiredFieldsDialog,
  onRequiredFieldsDialogChange,
  showReasonDialog,
  onReasonDialogChange,
  currentDragOperation,
  onRequiredFieldsComplete,
  onReasonComplete,
  onResetOperation
}: KanbanDialogsProps) => {
  return (
    <>
      <CreateStageDialog 
        open={isCreateStageDialogOpen}
        onOpenChange={onCreateStageDialogChange}
        funnelId={funnelId}
        onStageCreated={onStageCreated}
      />
      
      {currentDragOperation && showRequiredFieldsDialog && (
        <RequiredFieldsDialog
          open={showRequiredFieldsDialog}
          onOpenChange={(open) => {
            console.log('RequiredFieldsDialog onOpenChange:', open);
            onRequiredFieldsDialogChange(open);
            if (!open) {
              onResetOperation();
            }
          }}
          opportunity={currentDragOperation.opportunity}
          requiredFields={currentDragOperation.requiredFields}
          onComplete={onRequiredFieldsComplete}
          stageId={currentDragOperation.destinationStageId}
        />
      )}
      
      {currentDragOperation && showReasonDialog && (
        <OpportunityReasonDialog
          open={showReasonDialog}
          onOpenChange={(open) => {
            console.log('OpportunityReasonDialog onOpenChange:', open);
            onReasonDialogChange(open);
            if (!open) {
              onResetOperation();
            }
          }}
          opportunity={currentDragOperation.opportunity}
          needsWinReason={currentDragOperation.needsWinReason}
          needsLossReason={currentDragOperation.needsLossReason}
          availableWinReasons={currentDragOperation.availableWinReasons}
          availableLossReasons={currentDragOperation.availableLossReasons}
          onComplete={onReasonComplete}
        />
      )}
    </>
  );
};

export default KanbanDialogs;
