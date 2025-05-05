
import { useState } from "react";
import { Opportunity } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { formatCurrency, formatDateBRT } from "@/services/utils/dateUtils";
import ScheduledActionList from "../scheduledAction/ScheduledActionList";
import ScheduleActionForm from "../scheduledAction/ScheduleActionForm";
import CustomFieldsForm from "../customFields/CustomFieldsForm";

interface OpportunityDetailsTabsProps {
  opportunity: Opportunity;
  currentStage: any;
  onOpportunityUpdated: (opportunity: Opportunity) => void;
}

const OpportunityDetailsTabs = ({
  opportunity,
  currentStage,
  onOpportunityUpdated,
}: OpportunityDetailsTabsProps) => {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="details">Detalhes</TabsTrigger>
        <TabsTrigger value="customFields">Campos personalizados</TabsTrigger>
        <TabsTrigger value="actions">Ações agendadas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Cliente</p>
            <p className="font-medium">{opportunity.client}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Valor</p>
            <p className="font-medium">{formatCurrency(opportunity.value)}</p>
          </div>
          
          {opportunity.company && (
            <div>
              <p className="text-sm text-muted-foreground">Empresa</p>
              <p className="font-medium">{opportunity.company}</p>
            </div>
          )}
          
          <div>
            <p className="text-sm text-muted-foreground">Data de criação</p>
            <p className="font-medium">{formatDateBRT(opportunity.createdAt)}</p>
          </div>
          
          {opportunity.email && (
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{opportunity.email}</p>
            </div>
          )}
          
          {opportunity.phone && (
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{opportunity.phone}</p>
            </div>
          )}
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-end gap-2">
          <Button 
            onClick={() => setActiveTab("actions")}
            className="gap-1"
          >
            <Calendar className="h-4 w-4" />
            Gerenciar ações agendadas
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="customFields">
        <CustomFieldsForm 
          opportunity={opportunity}
          requiredFields={currentStage?.requiredFields || []}
          onCustomFieldsUpdated={onOpportunityUpdated}
        />
      </TabsContent>
      
      <TabsContent value="actions">
        <div className="mb-4">
          <ScheduleActionForm 
            opportunityId={opportunity.id}
            funnelId={opportunity.funnelId}
            stageId={opportunity.stageId}
            onActionScheduled={() => {
              // Refresh the action list when a new action is scheduled
              setActiveTab("actions");
            }} 
          />
        </div>
        
        <Separator className="my-4" />
        
        <ScheduledActionList opportunityId={opportunity.id} />
      </TabsContent>
    </Tabs>
  );
};

export default OpportunityDetailsTabs;
