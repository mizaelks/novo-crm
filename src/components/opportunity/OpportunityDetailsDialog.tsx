
import { useState, useEffect } from "react";
import { Opportunity, ScheduledAction, Stage } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { opportunityAPI, stageAPI } from "@/services/api";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Edit2, Calendar, Trash2 } from "lucide-react";
import { formatCurrency, formatDateBRT } from "@/services/utils/dateUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScheduleActionForm from "../scheduledAction/ScheduleActionForm";
import ScheduledActionList from "../scheduledAction/ScheduledActionList";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { Badge } from "@/components/ui/badge";
import EditOpportunityDialog from "./EditOpportunityDialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OpportunityDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  onOpportunityUpdated: (opportunity: Opportunity) => void;
  onOpportunityDeleted: (opportunityId: string) => void;
}

const OpportunityDetailsDialog = ({
  open,
  onOpenChange,
  opportunityId,
  onOpportunityUpdated,
  onOpportunityDeleted
}: OpportunityDetailsDialogProps) => {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage | null>(null);
  const { ConfirmDialog, showConfirmation } = useConfirmDialog();
  const [isSubmittingCustomFields, setIsSubmittingCustomFields] = useState(false);
  
  // Form for custom fields
  const customFieldsForm = useForm({
    defaultValues: {
      customFields: {} as Record<string, any>
    }
  });

  useEffect(() => {
    const loadOpportunityDetails = async () => {
      if (!open || !opportunityId) return;
      
      setLoading(true);
      try {
        const opportunityData = await opportunityAPI.getById(opportunityId);
        if (opportunityData) {
          setOpportunity(opportunityData);
          
          // Load the current stage to get required fields
          if (opportunityData.stageId) {
            const stageData = await stageAPI.getById(opportunityData.stageId);
            setCurrentStage(stageData);
          }
          
          // Reset form with custom fields
          customFieldsForm.reset({
            customFields: opportunityData.customFields || {}
          });
        }
      } catch (error) {
        console.error("Error loading opportunity details:", error);
        toast.error("Erro ao carregar detalhes da oportunidade");
      } finally {
        setLoading(false);
      }
    };

    loadOpportunityDetails();
  }, [open, opportunityId, customFieldsForm]);

  const handleDelete = async () => {
    if (!opportunity) return;
    
    const confirmed = await showConfirmation(
      "Excluir oportunidade",
      "Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita."
    );
    
    if (confirmed) {
      try {
        const success = await opportunityAPI.delete(opportunity.id);
        if (success) {
          toast.success("Oportunidade excluída com sucesso");
          onOpportunityDeleted(opportunity.id);
          onOpenChange(false);
        } else {
          toast.error("Erro ao excluir oportunidade");
        }
      } catch (error) {
        console.error("Error deleting opportunity:", error);
        toast.error("Erro ao excluir oportunidade");
      }
    }
  };

  const handleOpportunityUpdated = (updatedOpportunity: Opportunity) => {
    setOpportunity(updatedOpportunity);
    onOpportunityUpdated(updatedOpportunity);
  };

  const handleSubmitCustomFields = async (values: any) => {
    if (!opportunity) return;
    
    try {
      setIsSubmittingCustomFields(true);
      
      const updatedOpportunity = await opportunityAPI.update(opportunity.id, {
        customFields: values.customFields
      });
      
      if (updatedOpportunity) {
        setOpportunity(updatedOpportunity);
        onOpportunityUpdated(updatedOpportunity);
        toast.success("Campos personalizados atualizados com sucesso");
      } else {
        throw new Error("Falha ao atualizar campos personalizados");
      }
    } catch (error) {
      console.error("Error updating custom fields:", error);
      toast.error("Erro ao atualizar campos personalizados");
    } finally {
      setIsSubmittingCustomFields(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {loading ? "Carregando..." : opportunity?.title}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {loading ? (
            // Loading skeleton
            <div className="space-y-4">
              <div className="h-6 bg-muted animate-pulse rounded-md" />
              <div className="h-6 bg-muted animate-pulse rounded-md" />
              <div className="h-6 bg-muted animate-pulse rounded-md" />
            </div>
          ) : opportunity ? (
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
                <Form {...customFieldsForm}>
                  <form onSubmit={customFieldsForm.handleSubmit(handleSubmitCustomFields)} className="space-y-4">
                    {currentStage?.requiredFields && currentStage.requiredFields.length > 0 ? (
                      <>
                        {currentStage.requiredFields.map(field => (
                          <FormField
                            key={field.id}
                            control={customFieldsForm.control}
                            name={`customFields.${field.name}`}
                            render={({ field: formField }) => (
                              <FormItem>
                                <div className="flex items-center gap-2">
                                  <FormLabel>{field.name}</FormLabel>
                                  {field.isRequired && (
                                    <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                                  )}
                                </div>
                                <FormControl>
                                  {field.type === 'text' && (
                                    <Input 
                                      {...formField}
                                      value={formField.value || ''} 
                                      placeholder={`Digite ${field.name}`} 
                                    />
                                  )}
                                  {field.type === 'number' && (
                                    <Input 
                                      {...formField}
                                      type="number"
                                      value={formField.value || ''} 
                                      placeholder={`Digite ${field.name}`} 
                                    />
                                  )}
                                  {field.type === 'date' && (
                                    <Input 
                                      {...formField}
                                      type="date"
                                      value={formField.value || ''} 
                                    />
                                  )}
                                  {field.type === 'checkbox' && (
                                    <Checkbox 
                                      checked={formField.value || false}
                                      onCheckedChange={formField.onChange}
                                    />
                                  )}
                                  {field.type === 'select' && field.options && (
                                    <Select 
                                      value={formField.value || ''}
                                      onValueChange={formField.onChange}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={`Selecione ${field.name}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.options.map((option, index) => (
                                          <SelectItem key={index} value={option}>
                                            {option}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                        
                        <div className="flex justify-end mt-4">
                          <Button type="submit" disabled={isSubmittingCustomFields}>
                            {isSubmittingCustomFields ? "Salvando..." : "Salvar campos"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>Não há campos personalizados configurados para esta etapa.</p>
                        <p className="mt-2">
                          Para adicionar campos personalizados, edite a etapa atual no kanban.
                        </p>
                      </div>
                    )}
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="actions">
                <div className="mb-4">
                  <ScheduleActionForm 
                    opportunityId={opportunity.id} 
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
          ) : (
            <div className="text-center py-6">
              <p>Oportunidade não encontrada</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {opportunity && (
        <EditOpportunityDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          opportunityId={opportunity.id}
          onOpportunityUpdated={handleOpportunityUpdated}
        />
      )}
      
      <ConfirmDialog />
    </>
  );
};

export default OpportunityDetailsDialog;
