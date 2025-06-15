
import { useState, useEffect } from "react";
import { Opportunity } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { opportunityAPI, stageAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import EditOpportunityDialog from "./EditOpportunityDialog";
import OpportunityDetailsTabs from "./OpportunityDetailsTabs";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<any>(null);
  const { ConfirmDialog, showConfirmation } = useConfirmDialog();

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
        }
      } catch (error) {
        console.error("Error loading opportunity details:", error);
        toast.error("Erro ao carregar detalhes da oportunidade");
      } finally {
        setLoading(false);
      }
    };

    loadOpportunityDetails();
  }, [open, opportunityId]);

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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pr-12 flex-shrink-0">
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="flex-1">
                {loading ? "Carregando..." : opportunity?.title}
              </DialogTitle>
              <div className="flex gap-2 ml-4">
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
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              // Loading skeleton
              <div className="space-y-4 p-6">
                <div className="h-6 bg-muted animate-pulse rounded-md" />
                <div className="h-6 bg-muted animate-pulse rounded-md" />
                <div className="h-6 bg-muted animate-pulse rounded-md" />
              </div>
            ) : opportunity ? (
              <OpportunityDetailsTabs 
                opportunity={opportunity} 
                currentStage={currentStage}
                onOpportunityUpdated={handleOpportunityUpdated}
              />
            ) : (
              <div className="text-center py-6">
                <p>Oportunidade não encontrada</p>
              </div>
            )}
          </div>
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
