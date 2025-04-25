
import React from "react";
import { Opportunity, Stage } from "@/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Edit, Calendar, Clock, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ScheduleActionForm from "../scheduledAction/ScheduleActionForm";
import ScheduledActionList from "../scheduledAction/ScheduledActionList";
import { formatCurrency } from "@/services/utils/dateUtils";

interface OpportunityDetailsDialogProps {
  opportunity: Opportunity;
  stage: Stage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

const OpportunityDetailsDialog = ({
  opportunity,
  stage,
  open,
  onOpenChange,
  onEdit
}: OpportunityDetailsDialogProps) => {
  // Handler para quando uma ação é agendada com sucesso
  const handleActionScheduled = () => {
    // Recarregar a lista de ações agendadas
    // Na verdade o componente já faz isso por si mesmo, então apenas confirmamos que o handler existe
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <ScrollArea className="max-h-[calc(90vh-4rem)] pr-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{opportunity.title}</h2>
              <p className="text-muted-foreground">
                Adicionado em {format(new Date(opportunity.createdAt), "dd/MM/yyyy")}
              </p>
            </div>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{opportunity.client}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="font-medium">{opportunity.company || "Não informado"}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-medium">{formatCurrency(opportunity.value)}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Etapa</p>
                <p className="font-medium">{stage.name}</p>
              </div>
            </div>
          </div>
          
          {/* Display contact information if available */}
          {(opportunity.phone || opportunity.email) && (
            <>
              <div className="h-px bg-border my-4" />
              <div className="grid grid-cols-2 gap-4">
                {opportunity.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p>{opportunity.phone}</p>
                  </div>
                )}
                {opportunity.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{opportunity.email}</p>
                  </div>
                )}
              </div>
            </>
          )}
          
          <div className="h-px bg-border my-4" />
          
          <Tabs defaultValue="schedule">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="schedule">Agendar Ação</TabsTrigger>
              <TabsTrigger value="scheduled">Ações Agendadas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="schedule" className="py-4">
              <ScheduleActionForm 
                opportunityId={opportunity.id} 
                onActionScheduled={handleActionScheduled} 
              />
            </TabsContent>
            
            <TabsContent value="scheduled" className="py-4">
              <ScheduledActionList opportunityId={opportunity.id} />
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityDetailsDialog;
