
import { UseFormReturn } from "react-hook-form";
import { RequiredField, RequiredTask, StageAlertConfig, StageMigrateConfig, SortingOption } from "@/types";
import { Separator } from "@/components/ui/separator";
import { StageBasicForm } from "./StageBasicForm";
import { StageTypeToggles } from "./StageTypeToggles";
import { StageReasonConfig } from "./StageReasonConfig";
import { StageSortingConfig } from "./StageSortingConfig";
import { StageAlertConfigComponent } from "./StageAlertConfig";
import { StageMigrateConfigComponent } from "./StageMigrateConfig";
import StageRequiredFields from "./StageRequiredFields";
import StageRequiredTasks from "./StageRequiredTasks";

interface EditStageFormSectionsProps {
  form: UseFormReturn<any>;
  stageId: string;
  currentFunnelId: string;
  requiredFields: RequiredField[];
  setRequiredFields: (fields: RequiredField[]) => void;
  requiredTasks: RequiredTask[];
  setRequiredTasks: (tasks: RequiredTask[]) => void;
  alertConfig: StageAlertConfig;
  setAlertConfig: (config: StageAlertConfig) => void;
  migrateConfig: StageMigrateConfig;
  setMigrateConfig: (config: StageMigrateConfig) => void;
  sortConfig: { type: SortingOption; enabled: boolean };
  setSortConfig: (config: { type: SortingOption; enabled: boolean }) => void;
  winReasonRequired: boolean;
  setWinReasonRequired: (required: boolean) => void;
  lossReasonRequired: boolean;
  setLossReasonRequired: (required: boolean) => void;
  winReasons: string[];
  setWinReasons: (reasons: string[]) => void;
  lossReasons: string[];
  setLossReasons: (reasons: string[]) => void;
}

export const EditStageFormSections = ({
  form,
  stageId,
  currentFunnelId,
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
  setLossReasons
}: EditStageFormSectionsProps) => {
  return (
    <div className="space-y-4">
      <StageBasicForm form={form} />
      
      <StageTypeToggles form={form} />
      
      <Separator className="my-4" />
      
      <StageReasonConfig
        winReasonRequired={winReasonRequired}
        lossReasonRequired={lossReasonRequired}
        winReasons={winReasons}
        lossReasons={lossReasons}
        onWinReasonRequiredChange={setWinReasonRequired}
        onLossReasonRequiredChange={setLossReasonRequired}
        onWinReasonsChange={setWinReasons}
        onLossReasonsChange={setLossReasons}
        isWinStage={form.watch('isWinStage')}
        isLossStage={form.watch('isLossStage')}
      />
      
      <Separator className="my-4" />
      
      <StageSortingConfig
        control={form.control}
        sortConfig={sortConfig}
        onSortConfigChange={setSortConfig}
      />
      
      <Separator className="my-4" />
      
      <StageAlertConfigComponent
        alertConfig={alertConfig}
        onAlertConfigChange={setAlertConfig}
      />
      
      <Separator className="my-4" />
      
      <StageMigrateConfigComponent
        migrateConfig={migrateConfig}
        onMigrateConfigChange={setMigrateConfig}
        currentFunnelId={currentFunnelId}
      />
      
      <Separator className="my-4" />
      
      <StageRequiredFields 
        requiredFields={requiredFields}
        setRequiredFields={setRequiredFields}
        stageId={stageId}
      />
      
      <Separator className="my-4" />
      
      <StageRequiredTasks 
        requiredTasks={requiredTasks}
        setRequiredTasks={setRequiredTasks}
        stageId={stageId}
      />
    </div>
  );
};
