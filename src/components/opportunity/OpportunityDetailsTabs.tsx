
import { useState, useEffect } from "react";
import { Opportunity, ScheduledAction } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar, ClipboardList, Clock } from "lucide-react";
import { formatCurrency, formatDateBRT } from "@/services/utils/dateUtils";
import ScheduledActionList from "../scheduledAction/ScheduledActionList";
import ScheduleActionForm from "../scheduledAction/ScheduleActionForm";
import CustomFieldsForm from "../customFields/CustomFieldsForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { scheduledActionAPI } from "@/services/scheduledActionAPI";

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
  const [scheduledActions, setScheduledActions] = useState<ScheduledAction[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);

  useEffect(() => {
    const loadScheduledActions = async () => {
      if (!opportunity?.id) return;
      
      setLoadingActions(true);
      try {
        const actions = await scheduledActionAPI.getByOpportunityId(opportunity.id);
        setScheduledActions(actions);
      } catch (error) {
        console.error("Error loading scheduled actions:", error);
      } finally {
        setLoadingActions(false);
      }
    };

    loadScheduledActions();
  }, [opportunity?.id]);

  const pendingActions = scheduledActions.filter(action => action.status === 'pending');

  return (
    <div className="px-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span>Detalhes</span>
            {pendingActions.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1 bg-orange-100 text-orange-800">
                <Clock className="w-3 h-3 mr-1" />
                {pendingActions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="customFields" className="flex items-center gap-2">
            <span>Campos personalizados</span> 
            {currentStage?.requiredFields?.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {currentStage.requiredFields.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Ações agendadas</span>
            {scheduledActions.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {scheduledActions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informações básicas</CardTitle>
              <CardDescription>Detalhes principais da oportunidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                  <p className="font-medium">{opportunity.client}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valor</p>
                  <p className="font-medium">{formatCurrency(opportunity.value)}</p>
                </div>
                
                {opportunity.company && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Empresa</p>
                    <p className="font-medium">{opportunity.company}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Data de criação</p>
                  <p className="font-medium">{formatDateBRT(opportunity.createdAt)}</p>
                </div>
                
                {opportunity.email && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{opportunity.email}</p>
                  </div>
                )}
                
                {opportunity.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                    <p className="font-medium">{opportunity.phone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {pendingActions.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  Tarefas Pendentes
                </CardTitle>
                <CardDescription>Ações agendadas que precisam ser executadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingActions.slice(0, 3).map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 bg-white rounded-md border">
                      <div>
                        <p className="font-medium text-sm">{action.actionType}</p>
                        <p className="text-xs text-muted-foreground">
                          Agendado para: {formatDateBRT(action.scheduledDateTime)}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Pendente
                      </Badge>
                    </div>
                  ))}
                  {pendingActions.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      +{pendingActions.length - 3} tarefas pendentes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end gap-2">
            <Button 
              onClick={() => setActiveTab("actions")}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Gerenciar ações agendadas
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="customFields" className="space-y-4">
          <CustomFieldsForm 
            opportunity={opportunity}
            requiredFields={currentStage?.requiredFields || []}
            onCustomFieldsUpdated={onOpportunityUpdated}
          />
        </TabsContent>
        
        <TabsContent value="actions" className="space-y-4">
          <Card className="mb-4">
            <CardHeader className="pb-3">
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
    </div>
  );
};

export default OpportunityDetailsTabs;
