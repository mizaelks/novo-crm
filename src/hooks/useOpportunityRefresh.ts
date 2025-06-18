
import { useState, useCallback } from "react";
import { opportunityAPI } from "@/services/api";
import { Opportunity } from "@/types";

export const useOpportunityRefresh = () => {
  const [refreshing, setRefreshing] = useState(false);

  const refreshOpportunity = useCallback(async (opportunityId: string): Promise<Opportunity | null> => {
    try {
      setRefreshing(true);
      const refreshedOpportunity = await opportunityAPI.getById(opportunityId);
      return refreshedOpportunity;
    } catch (error) {
      console.error("Error refreshing opportunity:", error);
      return null;
    } finally {
      setRefreshing(false);
    }
  }, []);

  return { refreshOpportunity, refreshing };
};
