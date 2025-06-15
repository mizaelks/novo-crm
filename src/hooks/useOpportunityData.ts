
import { useState, useEffect, useMemo } from "react";
import { Opportunity, Funnel, Stage } from "@/types";
import { opportunityAPI } from "@/services/opportunityAPI";
import { funnelAPI } from "@/services/funnelAPI";
import { stageAPI } from "@/services/stageAPI";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export const useOpportunityData = (showArchived: boolean) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  // Get unique clients
  const uniqueClients = useMemo(() => {
    const clients = opportunities.map(opp => opp.client);
    return [...new Set(clients)].filter(Boolean).sort();
  }, [opportunities]);

  // Load opportunities based on archive view
  const loadOpportunities = async () => {
    try {
      const data = showArchived 
        ? await opportunityAPI.getArchived()
        : await opportunityAPI.getAll(false);
      setOpportunities(data);
    } catch (error) {
      handleError(error, "Erro ao carregar oportunidades");
    }
  };

  // Load opportunities when archive view changes
  useEffect(() => {
    loadOpportunities();
  }, [showArchived]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [opportunitiesData, funnelsData] = await Promise.all([
          showArchived ? opportunityAPI.getArchived() : opportunityAPI.getAll(false),
          funnelAPI.getAll()
        ]);
        
        setOpportunities(opportunitiesData);
        setFunnels(funnelsData);
        
        // Load all stages from all funnels
        const allStages: Stage[] = [];
        for (const funnel of funnelsData) {
          const stagesData = await stageAPI.getByFunnelId(funnel.id);
          allStages.push(...stagesData);
        }
        setStages(allStages);
      } catch (error) {
        handleError(error, "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getFunnelName = (funnelId: string): string => {
    const funnel = funnels.find(f => f.id === funnelId);
    return funnel ? funnel.name : "Funil não encontrado";
  };

  const getStageName = (stageId: string): string => {
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.name : "Etapa não encontrada";
  };

  const getStageAlertStatus = (opportunity: Opportunity): boolean => {
    const stage = stages.find(s => s.id === opportunity.stageId);
    if (!stage?.alertConfig?.enabled) return false;
    
    const stageChangeDate = opportunity.lastStageChangeAt || opportunity.createdAt;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - stageChangeDate.getTime());
    const daysInStage = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return daysInStage >= stage.alertConfig.maxDaysInStage;
  };

  return {
    opportunities,
    funnels,
    stages,
    loading,
    uniqueClients,
    loadOpportunities,
    getFunnelName,
    getStageName,
    getStageAlertStatus
  };
};
