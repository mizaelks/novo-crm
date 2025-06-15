
import { useState, useEffect } from "react";
import { subDays } from "date-fns";
import { toast } from "sonner";
import { opportunityAPI } from "@/services/opportunityAPI";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Opportunity } from "@/types";

interface ArchiveSettings {
  enabled: boolean;
  period: number; // em dias
  lastRun: string | null;
}

export const useArchiveSettings = () => {
  const [archiveSettings, setArchiveSettings] = useLocalStorage<ArchiveSettings>("archiveSettings", {
    enabled: false,
    period: 30, // 30 dias padrão
    lastRun: null,
  });

  // Função para arquivar oportunidades automaticamente
  const processAutoArchive = async () => {
    if (!archiveSettings.enabled) return;
    
    try {
      // Get all active opportunities
      const allOpportunities = await opportunityAPI.getAll(false);
      const cutoffDate = subDays(new Date(), archiveSettings.period);
      
      // Find opportunities to archive
      const opportunitiesToArchive = allOpportunities.filter(
        opp => new Date(opp.createdAt) < cutoffDate
      );
      
      // Archive them
      for (const opp of opportunitiesToArchive) {
        await opportunityAPI.archive(opp.id);
      }
      
      if (opportunitiesToArchive.length > 0) {
        toast.success(`${opportunitiesToArchive.length} oportunidades arquivadas automaticamente`);
      }
      
      // Update last run
      setArchiveSettings({
        ...archiveSettings,
        lastRun: new Date().toISOString()
      });

      return opportunitiesToArchive.length;
    } catch (error) {
      console.error("Erro no arquivamento automático:", error);
      toast.error("Erro no arquivamento automático");
      return 0;
    }
  };

  // Verificar arquivamento automático na inicialização
  useEffect(() => {
    if (archiveSettings.enabled) {
      const lastRun = archiveSettings.lastRun 
        ? new Date(archiveSettings.lastRun) 
        : null;
      
      // Se nunca foi executado ou a última execução foi há mais de um dia
      if (!lastRun || (new Date().getTime() - lastRun.getTime() > 24 * 60 * 60 * 1000)) {
        processAutoArchive();
      }
    }
  }, [archiveSettings.enabled]);

  return {
    archiveSettings,
    setArchiveSettings,
    processAutoArchive
  };
};
