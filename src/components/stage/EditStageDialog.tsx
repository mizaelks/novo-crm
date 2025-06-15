
import { Dialog } from "@/components/ui/dialog";
import { Stage } from "@/types";
import { EditStageDialogContent } from "./EditStageDialogContent";

interface EditStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stageId: string;
  onStageUpdated: (stage: Stage) => void;
}

const EditStageDialog = ({
  open,
  onOpenChange,
  stageId,
  onStageUpdated
}: EditStageDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <EditStageDialogContent
        stageId={stageId}
        open={open}
        onOpenChange={onOpenChange}
        onStageUpdated={onStageUpdated}
      />
    </Dialog>
  );
};

export default EditStageDialog;
