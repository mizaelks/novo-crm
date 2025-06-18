
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Shuffle } from "lucide-react";
import { Opportunity, Funnel, Stage, RequiredField } from "@/types";
import { funnelAPI, stageAPI, opportunityAPI } from "@/services/api";
import { requiredElementsService } from "@/services/requiredElementsService";
import RequiredFieldsDialog from "./RequiredFieldsDialog";
import { toast } from "sonner";

interface OpportunityMoveActionsProps {
  opportunity: Opportunity;
  currentFunnel: Funnel;
  currentStage: Stage;
  onOpportunityMoved: (updatedOpportunity: Opportunity) => void;
}

const OpportunityMoveActions = ({
  opportunity,
  currentFunnel,
  currentStage,
  onOpportunityMoved,
}: OpportunityMoveActionsProps) => {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedFunnelId, setSelectedFunnelId] = useState(opportunity.funnelId);
  const [selectedStageId, setSelectedStageId] = useState(opportunity.stageId);
  const [loadingFunnels, setLoadingFunnels] = useState(false);
  const [loadingStages, setLoadingStages] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  
  // Required fields dialog state
  const [showRequiredFieldsDialog, setShowRequiredFieldsDialog] = useState(false);
  const [pendingMoveStageId, setPendingMoveStageId] = useState<string>("");
  const [stageRequiredFields, setStageRequiredFields] = useState<RequiredField[]>([]);

  useEffect(() => {
    loadFunnels();
  }, []);

  useEffect(() => {
    if (selectedFunnelId && selectedFunnelId !== opportunity.funnelId) {
      loadStagesForFunnel(selectedFunnelId);
    } else {
      setStages(currentFunnel.stages || []);
      setSelectedStageId(opportunity.stageId);
    }
  }, [selectedFunnelId, currentFunnel.stages, opportunity.funnelId, opportunity.stageId]);

  const loadFunnels = async () => {
    setLoadingFunnels(true);
    try {
      const allFunnels = await funnelAPI.getAll();
      setFunnels(allFunnels);
    } catch (error) {
      console.error("Error loading funnels:", error);
      toast.error("Erro ao carregar funis");
    } finally {
      setLoadingFunnels(false);
    }
  };

  const loadStagesForFunnel = async (funnelId: string) => {
    setLoadingStages(true);
    try {
      const funnelStages = await stageAPI.getByFunnelId(funnelId);
      setStages(funnelStages);
      if (funnelStages.length > 0) {
        setSelectedStageId(funnelStages[0].id);
      }
    } catch (error) {
      console.error("Error loading stages:", error);
      toast.error("Erro ao carregar etapas");
    } finally {
      setLoadingStages(false);
    }
  };

  const checkRequiredFields = async (targetStageId: string): Promise<boolean> => {
    try {
      const { requiredFields } = await requiredElementsService.getStageRequirements(targetStageId);
      console.log('Checking required fields for stage:', targetStageId, requiredFields);
      
      if (requiredFields && requiredFields.length > 0) {
        // Check if any required fields are missing
        const missingFields = requiredFields.filter(field => {
          const fieldValue = opportunity.customFields?.[field.name];
          if (field.isRequired) {
            if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
              return true;
            }
            if (field.type === 'checkbox' && fieldValue !== true) {
              return true;
            }
          }
          return false;
        });

        if (missingFields.length > 0) {
          console.log('Missing required fields:', missingFields);
          setStageRequiredFields(missingFields);
          setPendingMoveStageId(targetStageId);
          setShowRequiredFieldsDialog(true);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking required fields:', error);
      return true; // Continue with move if check fails
    }
  };

  const executeMoveToStage = async (targetStageId: string, updatedOpportunityData?: Partial<Opportunity>) => {
    setIsMoving(true);
    try {
      console.log('Moving opportunity to stage:', targetStageId);
      
      let updatedOpportunity: Opportunity | null;
      
      if (updatedOpportunityData) {
        // Update opportunity with additional data first
        updatedOpportunity = await opportunityAPI.update(opportunity.id, {
          stageId: targetStageId,
          ...updatedOpportunityData
        });
      } else {
        // Simple move
        updatedOpportunity = await opportunityAPI.move(opportunity.id, targetStageId);
      }

      if (updatedOpportunity) {
        // Process automatic stage requirements (tasks and fields)
        const processedOpportunity = await requiredElementsService.processStageRequirements(
          updatedOpportunity,
          targetStageId
        );

        const finalOpportunity = processedOpportunity || updatedOpportunity;
        
        // Update UI immediately
        onOpportunityMoved(finalOpportunity);
        setSelectedStageId(finalOpportunity.stageId);
        
        toast.success("Oportunidade movida com sucesso!");
        return finalOpportunity;
      } else {
        toast.error("Erro ao mover oportunidade");
        return null;
      }
    } catch (error) {
      console.error("Error moving opportunity:", error);
      toast.error("Erro ao mover oportunidade");
      return null;
    } finally {
      setIsMoving(false);
    }
  };

  const handleMoveToStage = async () => {
    if (selectedStageId === opportunity.stageId) {
      toast.info("A oportunidade já está nesta etapa");
      return;
    }

    // Check for required fields first
    const canProceed = await checkRequiredFields(selectedStageId);
    if (!canProceed) {
      return; // Required fields dialog will be shown
    }

    await executeMoveToStage(selectedStageId);
  };

  const handleMoveBetweenFunnels = async () => {
    if (selectedFunnelId === opportunity.funnelId) {
      toast.info("A oportunidade já está neste funil");
      return;
    }

    if (!selectedStageId) {
      toast.error("Selecione uma etapa de destino");
      return;
    }

    // Check for required fields first
    const canProceed = await checkRequiredFields(selectedStageId);
    if (!canProceed) {
      return; // Required fields dialog will be shown
    }

    setIsMoving(true);
    try {
      console.log(`Moving opportunity ${opportunity.id} to funnel ${selectedFunnelId}, stage ${selectedStageId}`);
      
      const updatedOpportunity = await opportunityAPI.update(opportunity.id, {
        funnelId: selectedFunnelId,
        stageId: selectedStageId
      });
      
      if (updatedOpportunity) {
        // Process automatic stage requirements
        const processedOpportunity = await requiredElementsService.processStageRequirements(
          updatedOpportunity,
          selectedStageId
        );

        const finalOpportunity = processedOpportunity || updatedOpportunity;
        
        onOpportunityMoved(finalOpportunity);
        setSelectedFunnelId(finalOpportunity.funnelId);
        setSelectedStageId(finalOpportunity.stageId);
        
        toast.success("Oportunidade movida para o funil com sucesso!");
      } else {
        toast.error("Erro ao mover oportunidade para o funil");
      }
    } catch (error) {
      console.error("Error moving opportunity between funnels:", error);
      toast.error("Erro ao mover oportunidade para o funil");
    } finally {
      setIsMoving(false);
    }
  };

  const handleRequiredFieldsComplete = (success: boolean, updatedOpportunity?: Opportunity) => {
    setShowRequiredFieldsDialog(false);
    
    if (success && pendingMoveStageId && updatedOpportunity) {
      // Continue with the move using the updated opportunity data
      executeMoveToStage(pendingMoveStageId, updatedOpportunity);
    }
    
    setPendingMoveStageId("");
    setStageRequiredFields([]);
  };

  const isInDifferentFunnel = selectedFunnelId !== opportunity.funnelId;
  const isInDifferentStage = selectedStageId !== opportunity.stageId;
  const canMove = isInDifferentFunnel || isInDifferentStage;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Movimentar Oportunidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Funil de Destino</label>
              <Select
                value={selectedFunnelId}
                onValueChange={setSelectedFunnelId}
                disabled={loadingFunnels || isMoving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um funil" />
                </SelectTrigger>
                <SelectContent>
                  {funnels.map((funnel) => (
                    <SelectItem key={funnel.id} value={funnel.id}>
                      {funnel.name}
                      {funnel.id === opportunity.funnelId && " (Atual)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Etapa de Destino</label>
              <Select
                value={selectedStageId}
                onValueChange={setSelectedStageId}
                disabled={loadingStages || isMoving || !selectedFunnelId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                      {stage.id === opportunity.stageId && " (Atual)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {isInDifferentFunnel ? (
              <Button
                onClick={handleMoveBetweenFunnels}
                disabled={!canMove || isMoving}
                className="flex-1"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                {isMoving ? "Movendo..." : "Mover para Funil"}
              </Button>
            ) : (
              <Button
                onClick={handleMoveToStage}
                disabled={!canMove || isMoving}
                className="flex-1"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                {isMoving ? "Movendo..." : "Mover para Etapa"}
              </Button>
            )}
          </div>

          {!canMove && (
            <p className="text-sm text-muted-foreground text-center">
              Selecione um funil ou etapa diferente para mover a oportunidade
            </p>
          )}
        </CardContent>
      </Card>

      <RequiredFieldsDialog
        open={showRequiredFieldsDialog}
        onOpenChange={setShowRequiredFieldsDialog}
        opportunity={opportunity}
        requiredFields={stageRequiredFields}
        onComplete={handleRequiredFieldsComplete}
        stageId={pendingMoveStageId}
      />
    </>
  );
};

export default OpportunityMoveActions;
