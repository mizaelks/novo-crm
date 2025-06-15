
import { useState } from "react";
import { toast } from "sonner";
import { opportunityAPI } from "@/services/opportunityAPI";
import { Opportunity } from "@/types";

export const useOpportunityOperations = () => {
  const [loading, setLoading] = useState(false);

  // Função para arquivar/desarquivar oportunidades
  const archiveOpportunity = async (opportunity: Opportunity, archive: boolean) => {
    try {
      const success = archive 
        ? await opportunityAPI.archive(opportunity.id)
        : await opportunityAPI.unarchive(opportunity.id);
      
      if (success) {
        toast.success(archive ? "Oportunidade arquivada com sucesso" : "Oportunidade restaurada com sucesso");
        return true;
      } else {
        toast.error(`Erro ao ${archive ? 'arquivar' : 'restaurar'} oportunidade`);
        return false;
      }
    } catch (error) {
      console.error(`Erro ao ${archive ? 'arquivar' : 'restaurar'} oportunidade:`, error);
      toast.error(`Erro ao ${archive ? 'arquivar' : 'restaurar'} oportunidade`);
      return false;
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    try {
      const success = await opportunityAPI.delete(id);
      if (success) {
        toast.success("Oportunidade excluída com sucesso!");
        return true;
      } else {
        toast.error("Erro ao excluir oportunidade");
        return false;
      }
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      toast.error("Erro ao excluir oportunidade");
      return false;
    }
  };

  const refreshData = async (loadOpportunities: () => Promise<void>) => {
    try {
      setLoading(true);
      await loadOpportunities();
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Erro ao atualizar dados");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    archiveOpportunity,
    handleDeleteOpportunity,
    refreshData
  };
};
