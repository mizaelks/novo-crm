
import { useState } from "react";
import { Opportunity } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardList } from "lucide-react";
import { formatCurrency, formatDateBRT } from "@/services/utils/dateUtils";
import ScheduledActionList from "../scheduledAction/ScheduledActionList";
import ScheduleActionForm from "../scheduledAction/ScheduleActionForm";
import CustomFieldsForm from "../customFields/CustomFieldsForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <TabsTrigger value="details" className="flex items-center gap-1">
          <ClipboardList className="w-4 h-4" />
          <span>Detalhes</span>
        </TabsTrigger>
        <TabsTrigger value="customFields" className="flex items-center gap-1">
          <span>Campos personalizados</span> 
          {currentStage?.requiredFields?.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1">
              {currentStage.requiredFields.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="actions" className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>Ações agendadas</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Informações básicas</CardTitle>
            <CardDescription>Detalhes principais da oportunidade</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
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
          </CardContent>
        </Card>
        
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
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Agendar nova ação</CardTitle>
            <CardDescription>Programe ações para esta oportunidade</CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleActionForm 
              opportunityId={opportunity.id}
              funnelId={opportunity.funnelId}
              stageId={opportunity.stageId}
              onActionScheduled={() => {
                // Refresh the action list when a new action is scheduled
                setActiveTab("actions");
              }} 
            />
          </CardContent>
        </Card>
        
        <Separator className="my-4" />
        
        <ScheduledActionList opportunityId={opportunity.id} />
      </TabsContent>
    </Tabs>
  );
};

export default OpportunityDetailsTabs;
