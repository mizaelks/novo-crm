
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Shuffle, AlertCircle } from "lucide-react";
import { Opportunity, Funnel, Stage } from "@/types";
import { funnelAPI, stageAPI } from "@/services/api";
import { useOpportunityMove } from "@/hooks/useOpportunityMove";
import { useOpportunityFunnelMove } from "@/hooks/useOpportunityFunnelMove";
import { toast } from "sonner";
import RequiredFieldsDialog from "./RequiredFieldsDialog";
import OpportunityReasonDialog from "./OpportunityReasonDialog";

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
  const [destinationStage, setDestinationStage] = useState<Stage | null>(null);
  const [showRequiredFieldsDialog, setShowRequiredFieldsDialog] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);

  const { moveOpportunity, isMoving } = useOpportunityMove();
  const { moveBetweenFunnels, isMovingBetweenFunnels } = useOpportunityFunnelMove();

  useEffect(() => {
    loadFunnels();
  }, []);

  useEffect(() => {
    if (selectedFunnelId && selectedFunnelId !== opportunity.funnelId) {
      loadStagesForFunnel(selectedFunnelId);
    } else {
      setStages(currentFunnel.stages);
      setSelectedStageId(opportunity.stageId);
    }
  }, [selectedFunnelId, currentFunnel.stages, opportunity.funnelId, opportunity.stageId]);

  useEffect(() => {
    if (selectedStageId) {
      const stage = stages.find(s => s.id === selectedStageId);
      setDestinationStage(stage || null);
    }
  }, [selectedStageId, stages]);

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
      // Auto-select first stage of new funnel
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

  const checkRequirements = (stage: Stage) => {
    const hasRequiredFields = stage.requiredFields && stage.requiredFields.length > 0;
    const needsWinReason = stage.isWinStage && stage.winReasonRequired;
    const needsLossReason = stage.isLossStage && stage.lossReasonRequired;
    
    return {
      hasRequiredFields,
      needsReasons: needsWinReason || needsLossReason,
      requiresValidation: hasRequiredFields || needsWinReason || needsLossReason
    };
  };

  const handleMoveToStage = async () => {
    if (selectedStageId === opportunity.stageId) {
      toast.info("A oportunidade já está nesta etapa");
      return;
    }

    if (!destinationStage) {
      toast.error("Etapa de destino não encontrada");
      return;
    }

    const requirements = checkRequirements(destinationStage);
    
    if (requirements.requiresValidation) {
      // Se tem campos obrigatórios, mostrar diálogo de campos primeiro
      if (requirements.hasRequiredFields) {
        setShowRequiredFieldsDialog(true);
        return;
      }
      
      // Se só tem motivos, mostrar diálogo de motivos
      if (requirements.needsReasons) {
        setShowReasonDialog(true);
        return;
      }
    }

    // Mover diretamente se não há requisitos
    const updatedOpportunity = await moveOpportunity(
      opportunity,
      selectedStageId,
      onOpportunityMoved
    );

    if (updatedOpportunity) {
      setSelectedStageId(updatedOpportunity.stageId);
    }
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

    if (!destinationStage) {
      toast.error("Etapa de destino não encontrada");
      return;
    }

    const requirements = checkRequirements(destinationStage);
    
    if (requirements.requiresValidation) {
      // Se tem campos obrigatórios, mostrar diálogo de campos primeiro
      if (requirements.hasRequiredFields) {
        setShowRequiredFieldsDialog(true);
        return;
      }
      
      // Se só tem motivos, mostrar diálogo de motivos
      if (requirements.needsReasons) {
        setShowReasonDialog(true);
        return;
      }
    }

    const updatedOpportunity = await moveBetweenFunnels(
      opportunity,
      selectedFunnelId,
      selectedStageId,
      onOpportunityMoved
    );

    if (updatedOpportunity) {
      setSelectedFunnelId(updatedOpportunity.funnelId);
      setSelectedStageId(updatedOpportunity.stageId);
    }
  };

  const handleRequiredFieldsComplete = (success: boolean, updatedOpportunity?: Opportunity) => {
    setShowRequiredFieldsDialog(false);
    
    if (success && destinationStage) {
      const requirements = checkRequirements(destinationStage);
      
      // Se ainda precisa de motivos, mostrar diálogo de motivos
      if (requirements.needsReasons) {
        setShowReasonDialog(true);
        return;
      }
      
      // Senão, finalizar movimento
      if (updatedOpportunity) {
        onOpportunityMoved(updatedOpportunity);
      }
    }
  };

  const handleReasonComplete = (success: boolean, updatedOpportunity?: Opportunity) => {
    setShowReasonDialog(false);
    
    if (success && updatedOpportunity) {
      onOpportunityMoved(updatedOpportunity);
    }
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
          {destinationStage && (destinationStage.requiredFields?.length > 0 || 
            (destinationStage.isWinStage && destinationStage.winReasonRequired) ||
            (destinationStage.isLossStage && destinationStage.lossReasonRequired)) && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Esta etapa possui campos obrigatórios ou requer motivos que serão solicitados.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Funil de Destino</label>
              <Select
                value={selectedFunnelId}
                onValueChange={setSelectedFunnelId}
                disabled={loadingFunnels || isMoving || isMovingBetweenFunnels}
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
                disabled={loadingStages || isMoving || isMovingBetweenFunnels || !selectedFunnelId}
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
                disabled={!canMove || isMoving || isMovingBetweenFunnels}
                className="flex-1"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                {isMovingBetweenFunnels ? "Movendo..." : "Mover para Funil"}
              </Button>
            ) : (
              <Button
                onClick={handleMoveToStage}
                disabled={!canMove || isMoving || isMovingBetweenFunnels}
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

      {destinationStage && (
        <>
          <RequiredFieldsDialog
            open={showRequiredFieldsDialog}
            onOpenChange={setShowRequiredFieldsDialog}
            opportunity={opportunity}
            requiredFields={destinationStage.requiredFields || []}
            onComplete={handleRequiredFieldsComplete}
            stageId={destinationStage.id}
          />

          <OpportunityReasonDialog
            open={showReasonDialog}
            onOpenChange={setShowReasonDialog}
            opportunity={opportunity}
            needsWinReason={destinationStage.isWinStage && destinationStage.winReasonRequired}
            needsLossReason={destinationStage.isLossStage && destinationStage.lossReasonRequired}
            availableWinReasons={destinationStage.winReasons || []}
            availableLossReasons={destinationStage.lossReasons || []}
            onComplete={handleReasonComplete}
          />
        </>
      )}
    </>
  );
};

export default OpportunityMoveActions;
