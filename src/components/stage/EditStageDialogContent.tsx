
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Stage } from "@/types";
import { useEditStageForm, StageFormData } from "@/hooks/useEditStageForm";
import { EditStageFormSections } from "./EditStageFormSections";

interface EditStageDialogContentProps {
  stageId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStageUpdated: (stage: Stage) => void;
}

export const EditStageDialogContent = ({
  stageId,
  open,
  onOpenChange,
  onStageUpdated
}: EditStageDialogContentProps) => {
  const {
    stage,
    loading,
    isSubmitting,
    form,
    requiredFields,
    setRequiredFields,
    requiredTasks,
    setRequiredTasks,
    alertConfig,
    setAlertConfig,
    migrateConfig,
    setMigrateConfig,
    sortConfig,
    setSortConfig,
    winReasonRequired,
    setWinReasonRequired,
    lossReasonRequired,
    setLossReasonRequired,
    winReasons,
    setWinReasons,
    lossReasons,
    setLossReasons,
    submitForm
  } = useEditStageForm(stageId, open);

  const onSubmit = async (values: StageFormData) => {
    const success = await submitForm(values, onStageUpdated);
    if (success) {
      onOpenChange(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
      <DialogHeader className="pr-8">
        <DialogTitle>Editar etapa</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      
      {loading ? (
        <div className="space-y-2 px-6">
          <div className="h-10 bg-muted animate-pulse rounded-md" />
          <div className="h-10 bg-muted animate-pulse rounded-md" />
          <div className="h-10 bg-muted animate-pulse rounded-md" />
        </div>
      ) : (
        <div className="px-6">
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <EditStageFormSections
                form={form}
                stageId={stageId}
                currentFunnelId={stage?.funnelId || ''}
                requiredFields={requiredFields}
                setRequiredFields={setRequiredFields}
                requiredTasks={requiredTasks}
                setRequiredTasks={setRequiredTasks}
                alertConfig={alertConfig}
                setAlertConfig={setAlertConfig}
                migrateConfig={migrateConfig}
                setMigrateConfig={setMigrateConfig}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                winReasonRequired={winReasonRequired}
                setWinReasonRequired={setWinReasonRequired}
                lossReasonRequired={lossReasonRequired}
                setLossReasonRequired={setLossReasonRequired}
                winReasons={winReasons}
                setWinReasons={setWinReasons}
                lossReasons={lossReasons}
                setLossReasons={setLossReasons}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar alterações"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      )}
    </DialogContent>
  );
};
