
import { useState, useEffect } from "react";
import { subDays } from "date-fns";
import { toast } from "sonner";
import { opportunityAPI } from "@/services/opportunityAPI";
import { stageAPI } from "@/services/stageAPI";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Opportunity, Stage } from "@/types";

interface ArchiveSettings {
  enabled: boolean;
  period: number; // em dias
  lastRun: string | null;
  archiveWonOpportunities: boolean;
  archiveLostOpportunities: boolean;
  monthlySchedule: boolean; // Novo: execução no dia 1º às 00h
}

export const useArchiveSettings = () => {
  const [archiveSettings, setArchiveSettings] = useLocalStorage<ArchiveSettings>("archiveSettings", {
    enabled: false,
    period: 30,
    lastRun: null,
    archiveWonOpportunities: true,
    archiveLostOpportunities: true,
    monthlySchedule: true, // Padrão: execução mensal
  });

  // Função para verificar se deve executar o arquivamento automático
  const shouldRunAutoArchive = (): boolean => {
    if (!archiveSettings.enabled || !archiveSettings.monthlySchedule) return false;
    
    const now = new Date();
    const lastRun = archiveSettings.lastRun ? new Date(archiveSettings.lastRun) : null;
    
    // Verificar se é dia 1º do mês
    const isFirstDayOfMonth = now.getDate() === 1;
    
    // Se nunca executou e é dia 1º, executar
    if (!lastRun && isFirstDayOfMonth) return true;
    
    // Se já executou, verificar se é um novo mês
    if (lastRun) {
      const lastRunMonth = lastRun.getMonth();
      const lastRunYear = lastRun.getFullYear();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Se é dia 1º e é um mês/ano diferente da última execução
      if (isFirstDayOfMonth && (currentMonth !== lastRunMonth || currentYear !== lastRunYear)) {
        return true;
      }
    }
    
    return false;
  };

  // Função para arquivar oportunidades automaticamente
  const processAutoArchive = async () => {
    if (!archiveSettings.enabled) return 0;
    
    try {
      // Get all active opportunities and stages
      const [allOpportunities, allStages] = await Promise.all([
        opportunityAPI.getAll(false),
        stageAPI.getAll()
      ]);
      
      // Create a map of stages for quick lookup
      const stageMap = new Map<string, Stage>();
      allStages.forEach(stage => {
        stageMap.set(stage.id, stage);
      });
      
      const cutoffDate = subDays(new Date(), archiveSettings.period);
      
      // Find opportunities to archive based on settings
      const opportunitiesToArchive = allOpportunities.filter(opp => {
        const stage = stageMap.get(opp.stageId);
        if (!stage) return false;
        
        // Check if opportunity is old enough
        const isOldEnough = new Date(opp.createdAt) < cutoffDate;
        if (!isOldEnough) return false;
        
        // Check if we should archive based on stage type and settings
        if (stage.isWinStage && archiveSettings.archiveWonOpportunities) {
          return true;
        }
        
        if (stage.isLossStage && archiveSettings.archiveLostOpportunities) {
          return true;
        }
        
        return false;
      });
      
      // Archive them
      let archivedCount = 0;
      for (const opp of opportunitiesToArchive) {
        const success = await opportunityAPI.archive(opp.id);
        if (success) {
          archivedCount++;
        }
      }
      
      if (archivedCount > 0) {
        toast.success(`${archivedCount} oportunidades arquivadas automaticamente`);
      }
      
      // Update last run
      setArchiveSettings({
        ...archiveSettings,
        lastRun: new Date().toISOString()
      });

      return archivedCount;
    } catch (error) {
      console.error("Erro no arquivamento automático:", error);
      toast.error("Erro no arquivamento automático");
      return 0;
    }
  };

  // Verificar arquivamento automático na inicialização
  useEffect(() => {
    if (shouldRunAutoArchive()) {
      processAutoArchive();
    }
  }, [archiveSettings.enabled, archiveSettings.monthlySchedule]);

  return {
    archiveSettings,
    setArchiveSettings,
    processAutoArchive,
    shouldRunAutoArchive
  };
};
