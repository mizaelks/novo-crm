
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

  const { moveOpportunity, isMoving } = useOpportunityMove();
  const { moveBetweenFunnels, isMovingBetweenFunnels } = useOpportunityFunnelMove();

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

  const handleMoveToStage = async () => {
    if (selectedStageId === opportunity.stageId) {
      toast.info("A oportunidade já está nesta etapa");
      return;
    }

    const updatedOpportunity = await moveOpportunity(
      opportunity,
      selectedStageId,
      onOpportunityMoved
    );

    if (updatedOpportunity) {
      setSelectedStageId(updatedOpportunity.stageId);
      toast.success("Oportunidade movida com sucesso!");
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

    const updatedOpportunity = await moveBetweenFunnels(
      opportunity,
      selectedFunnelId,
      selectedStageId,
      onOpportunityMoved
    );

    if (updatedOpportunity) {
      setSelectedFunnelId(updatedOpportunity.funnelId);
      setSelectedStageId(updatedOpportunity.stageId);
      toast.success("Oportunidade movida com sucesso!");
    }
  };

  const isInDifferentFunnel = selectedFunnelId !== opportunity.funnelId;
  const isInDifferentStage = selectedStageId !== opportunity.stageId;
  const canMove = isInDifferentFunnel || isInDifferentStage;

  return (
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
  );
};

export default OpportunityMoveActions;
