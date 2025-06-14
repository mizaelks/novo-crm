
import { useState, useEffect } from "react";
import { Funnel, Stage, Opportunity } from "@/types";
import { funnelAPI, stageAPI } from "@/services/api";
import { toast } from "sonner";

export const useKanbanState = (funnelId: string) => {
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const funnelData = await funnelAPI.getById(funnelId);
        const stagesData = await stageAPI.getByFunnelId(funnelId);
        
        // Sort stages by order property to ensure consistent order
        const sortedStages = [...stagesData].sort((a, b) => a.order - b.order);
        
        setFunnel(funnelData);
        setStages(sortedStages);
      } catch (error) {
        console.error("Error loading kanban data:", error);
        toast.error("Erro ao carregar dados do kanban.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [funnelId]);

  const handleStageCreated = (newStage: Stage) => {
    console.log("Stage created:", newStage);
    
    // Ensure the stage has all required properties
    if (!newStage.opportunities) {
      newStage.opportunities = [];
    }
    
    // Add the new stage to the existing stages
    setStages(prevStages => [...prevStages, newStage]);
  };

  const handleOpportunityCreated = (newOpportunity: Opportunity) => {
    const updatedStages = stages.map(stage => {
      if (stage.id === newOpportunity.stageId) {
        return {
          ...stage,
          opportunities: [...stage.opportunities, newOpportunity]
        };
      }
      return stage;
    });
    
    setStages(updatedStages);
  };

  const handleStageUpdated = (updatedStage: Stage) => {
    const updatedStages = stages.map(stage => 
      stage.id === updatedStage.id ? {...updatedStage, opportunities: stage.opportunities} : stage
    );
    setStages(updatedStages);
  };

  return {
    funnel,
    stages,
    loading,
    setStages,
    handleStageCreated,
    handleOpportunityCreated,
    handleStageUpdated
  };
};
