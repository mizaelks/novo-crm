
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Shuffle } from "lucide-react";
import { Opportunity, Funnel, Stage } from "@/types";
import { funnelAPI, stageAPI, opportunityAPI } from "@/services/api";
import { useOpportunityMove } from "@/hooks/useOpportunityMove";
import { useOpportunityFunnelMove } from "@/hooks/useOpportunityFunnelMove";
import { toast } from "sonner";
import RequiredFieldsDialog from "./RequiredFieldsDialog";
import { OpportunityReasonDialog } from "./OpportunityReasonDialog";

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
  const [showRequiredFieldsDialog, setShowRequiredFieldsDialog] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [targetStage, setTargetStage] = useState<Stage | null>(null);

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

  const checkRequiredFields = async (stageId: string): Promise<{ hasRequired: boolean; stage: Stage | null }> => {
    try {
      const stage = await stageAPI.getById(stageId);
      if (!stage) return { hasRequired: false, stage: null };

      const hasRequiredFields = stage.requiredFields && stage.requiredFields.length > 0;
      const needsWinReason = stage.isWinStage && stage.winReasonRequired;
      const needsLossReason = stage.isLossStage && stage.lossReasonRequired;

      return {
        hasRequired: hasRequiredFields || needsWinReason || needsLossReason,
        stage
      };
    } catch (error) {
      console.error("Error checking required fields:", error);
      return { hasRequired: false, stage: null };
    }
  };

  const handleMoveToStage = async () => {
    if (selectedStageId === opportunity.stageId) {
      toast.info("A oportunidade já está nesta etapa");
      return;
    }

    // Check if target stage has required fields or reasons
    const { hasRequired, stage } = await checkRequiredFields(selectedStageId);
    
    if (hasRequired && stage) {
      setTargetStage(stage);
      
      // Check if only needs reasons (no required fields)
      const needsReasons = (stage.isWinStage && stage.winReasonRequired) || (stage.isLossStage && stage.lossReasonRequired);
      const hasRequiredFields = stage.requiredFields && stage.requiredFields.length > 0;
      
      if (needsReasons && !hasRequiredFields) {
        setShowReasonDialog(true);
        return;
      }
      
      if (hasRequiredFields) {
        setShowRequiredFieldsDialog(true);
        return;
      }
    }

    // No requirements, proceed with move
    await performMove();
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

    // Check if target stage has required fields or reasons
    const { hasRequired, stage } = await checkRequiredFields(selectedStageId);
    
    if (hasRequired && stage) {
      setTargetStage(stage);
      
      // Check if only needs reasons (no required fields)
      const needsReasons = (stage.isWinStage && stage.winReasonRequired) || (stage.isLossStage && stage.lossReasonRequired);
      const hasRequiredFields = stage.requiredFields && stage.requiredFields.length > 0;
      
      if (needsReasons && !hasRequiredFields) {
        setShowReasonDialog(true);
        return;
      }
      
      if (hasRequiredFields) {
        setShowRequiredFieldsDialog(true);
        return;
      }
    }

    // No requirements, proceed with move
    await performFunnelMove();
  };

  const performMove = async () => {
    // Immediate visual feedback
    const updatedOpportunity = { ...opportunity, stageId: selectedStageId };
    onOpportunityMoved(updatedOpportunity);
    
    try {
      const result = await moveOpportunity(
        opportunity,
        selectedStageId,
        onOpportunityMoved
      );

      if (result) {
        setSelectedStageId(result.stageId);
        toast.success("Oportunidade movida com sucesso!");
      }
    } catch (error) {
      // Revert visual change on error
      onOpportunityMoved(opportunity);
      toast.error("Erro ao mover oportunidade");
    }
  };

  const performFunnelMove = async () => {
    // Immediate visual feedback
    const updatedOpportunity = { 
      ...opportunity, 
      funnelId: selectedFunnelId, 
      stageId: selectedStageId 
    };
    onOpportunityMoved(updatedOpportunity);

    try {
      const result = await moveBetweenFunnels(
        opportunity,
        selectedFunnelId,
        selectedStageId,
        onOpportunityMoved
      );

      if (result) {
        setSelectedFunnelId(result.funnelId);
        setSelectedStageId(result.stageId);
        toast.success("Oportunidade movida com sucesso!");
      }
    } catch (error) {
      // Revert visual change on error
      onOpportunityMoved(opportunity);
      toast.error("Erro ao mover oportunidade");
    }
  };

  const handleRequiredFieldsComplete = async (success: boolean, updatedOpportunity?: Opportunity) => {
    setShowRequiredFieldsDialog(false);
    
    if (success && updatedOpportunity && targetStage) {
      // Check if still needs reasons after filling required fields
      const needsReasons = (targetStage.isWinStage && targetStage.winReasonRequired) || 
                          (targetStage.isLossStage && targetStage.lossReasonRequired);
      
      if (needsReasons) {
        setShowReasonDialog(true);
        return;
      }
    }
    
    // Proceed with move
    if (success) {
      if (selectedFunnelId !== opportunity.funnelId) {
        await performFunnelMove();
      } else {
        await performMove();
      }
    }
  };

  const handleReasonComplete = async (success: boolean) => {
    setShowReasonDialog(false);
    
    if (success) {
      // Proceed with move
      if (selectedFunnelId !== opportunity.funnelId) {
        await performFunnelMove();
      } else {
        await performMove();
      }
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

      {targetStage && (
        <>
          <RequiredFieldsDialog
            open={showRequiredFieldsDialog}
            onOpenChange={setShowRequiredFieldsDialog}
            opportunity={opportunity}
            requiredFields={targetStage.requiredFields || []}
            onComplete={handleRequiredFieldsComplete}
            stageId={targetStage.id}
          />
          
          <OpportunityReasonDialog
            open={showReasonDialog}
            onOpenChange={setShowReasonDialog}
            opportunity={opportunity}
            stage={targetStage}
            onComplete={handleReasonComplete}
          />
        </>
      )}
    </>
  );
};

export default OpportunityMoveActions;
