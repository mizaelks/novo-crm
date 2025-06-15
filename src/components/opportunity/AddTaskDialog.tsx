
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ScheduleActionForm from "@/components/scheduledAction/ScheduleActionForm";
import { Opportunity } from "@/types";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: Opportunity;
  onTaskAdded: () => void;
}

export const AddTaskDialog = ({ 
  open, 
  onOpenChange, 
  opportunity, 
  onTaskAdded 
}: AddTaskDialogProps) => {
  const handleActionScheduled = () => {
    onTaskAdded();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Tarefa - {opportunity.title}</DialogTitle>
        </DialogHeader>
        <ScheduleActionForm
          opportunityId={opportunity.id}
          funnelId={opportunity.funnelId}
          stageId={opportunity.stageId}
          onActionScheduled={handleActionScheduled}
        />
      </DialogContent>
    </Dialog>
  );
};
