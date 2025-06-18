
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Opportunity } from "@/types";
import ScheduledActionList from "../scheduledAction/ScheduledActionList";
import CustomFieldsForm from "../customFields/CustomFieldsForm";
import { OpportunityHistoryTab } from "./OpportunityHistoryTab";
import { Calendar, Settings, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { stageAPI } from "@/services/api";

interface OpportunityDetailsTabsProps {
  opportunity: Opportunity;
  currentStage?: any;
  onOpportunityUpdated: (opportunity: Opportunity) => void;
}

const OpportunityDetailsTabs = ({ 
  opportunity, 
  currentStage,
  onOpportunityUpdated 
}: OpportunityDetailsTabsProps) => {
  const [refreshedStage, setRefreshedStage] = useState(currentStage);

  // Refresh stage data when opportunity stage changes
  useEffect(() => {
    const loadStageData = async () => {
      if (opportunity.stageId) {
        try {
          const stageData = await stageAPI.getById(opportunity.stageId);
          setRefreshedStage(stageData);
        } catch (error) {
          console.error("Error loading stage data:", error);
        }
      }
    };

    loadStageData();
  }, [opportunity.stageId]);

  const handleCustomFieldsUpdated = (updatedOpportunity: Opportunity) => {
    console.log('Custom fields updated, refreshing opportunity:', updatedOpportunity);
    onOpportunityUpdated(updatedOpportunity);
  };

  return (
    <Tabs defaultValue="actions" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="actions" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Ações
        </TabsTrigger>
        <TabsTrigger value="fields" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Campos
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Histórico
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="actions" className="mt-6">
        <ScheduledActionList 
          opportunityId={opportunity.id}
        />
      </TabsContent>
      
      <TabsContent value="fields" className="mt-6">
        <CustomFieldsForm
          opportunity={opportunity}
          requiredFields={refreshedStage?.requiredFields || []}
          onCustomFieldsUpdated={handleCustomFieldsUpdated}
        />
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <OpportunityHistoryTab opportunityId={opportunity.id} />
      </TabsContent>
    </Tabs>
  );
};

export default OpportunityDetailsTabs;
