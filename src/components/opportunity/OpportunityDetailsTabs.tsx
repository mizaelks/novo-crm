
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Opportunity, Stage } from "@/types";
import OpportunityDetails from "./OpportunityDetails";
import OpportunityScheduledActions from "./OpportunityScheduledActions";
import OpportunityCustomFields from "./OpportunityCustomFields";

interface OpportunityDetailsTabsProps {
  opportunity: Opportunity;
  currentStage: Stage | null;
  onOpportunityUpdated: (opportunity: Opportunity) => void;
  initialTab?: string;
}

const OpportunityDetailsTabs = ({ 
  opportunity, 
  currentStage, 
  onOpportunityUpdated,
  initialTab = "details"
}: OpportunityDetailsTabsProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="details">Detalhes</TabsTrigger>
        <TabsTrigger value="custom-fields">Campos Personalizados</TabsTrigger>
        <TabsTrigger value="scheduled-actions">Ações Agendadas</TabsTrigger>
      </TabsList>
      
      <div className="flex-1 overflow-hidden">
        <TabsContent value="details" className="h-full overflow-y-auto mt-0">
          <OpportunityDetails 
            opportunity={opportunity} 
            onOpportunityUpdated={onOpportunityUpdated}
          />
        </TabsContent>
        
        <TabsContent value="custom-fields" className="h-full overflow-y-auto mt-0">
          <OpportunityCustomFields 
            opportunity={opportunity}
            currentStage={currentStage}
            onOpportunityUpdated={onOpportunityUpdated}
          />
        </TabsContent>
        
        <TabsContent value="scheduled-actions" className="h-full overflow-y-auto mt-0">
          <OpportunityScheduledActions 
            opportunity={opportunity}
            onOpportunityUpdated={onOpportunityUpdated}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default OpportunityDetailsTabs;
