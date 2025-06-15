
import { useState, useEffect } from "react";
import { stageAPI } from "@/services/api";
import { Stage } from "@/types";

export const useNextStage = (funnelId: string, stageId: string) => {
  const [nextStage, setNextStage] = useState<Stage | null>(null);

  useEffect(() => {
    const fetchNextStage = async () => {
      try {
        // Buscar todos os estágios do funil atual
        const stages = await stageAPI.getByFunnelId(funnelId);
        
        // Organizar por ordem
        const sortedStages = stages.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Encontrar o índice do estágio atual
        const currentStageIndex = sortedStages.findIndex(s => s.id === stageId);
        
        // Se não for o último estágio, definir o próximo
        if (currentStageIndex >= 0 && currentStageIndex < sortedStages.length - 1) {
          setNextStage(sortedStages[currentStageIndex + 1]);
        }
      } catch (error) {
        console.error("Erro ao buscar próximo estágio:", error);
      }
    };

    if (funnelId && stageId) {
      fetchNextStage();
    }
  }, [funnelId, stageId]);

  return nextStage;
};
