
import { useMemo } from "react";
import { Opportunity } from "@/types";
import { subDays, startOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { DateFilterType, DateRange } from "@/hooks/useDateFilter";

interface UseOpportunityFiltersProps {
  opportunities: Opportunity[];
  searchTerm: string;
  filterFunnel: string;
  filterStage: string;
  filterClient: string;
  dateFilter: DateFilterType;
  dateRange: DateRange;
}

export const useOpportunityFilters = ({
  opportunities,
  searchTerm,
  filterFunnel,
  filterStage,
  filterClient,
  dateFilter,
  dateRange
}: UseOpportunityFiltersProps) => {
  const applyDateFilter = (opportunity: Opportunity): boolean => {
    const createdAt = new Date(opportunity.createdAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (dateFilter) {
      case DateFilterType.TODAY:
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        return isWithinInterval(createdAt, { start: today, end: todayEnd });
        
      case DateFilterType.YESTERDAY:
        const yesterday = subDays(today, 1);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return isWithinInterval(createdAt, { start: yesterday, end: yesterdayEnd });
        
      case DateFilterType.THIS_WEEK:
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
        return createdAt >= startOfCurrentWeek && createdAt <= today;
        
      case DateFilterType.LAST_WEEK:
        const startOfPrevWeek = subDays(startOfWeek(today, { weekStartsOn: 1 }), 7);
        const endOfPrevWeek = subDays(startOfWeek(today, { weekStartsOn: 1 }), 1);
        return createdAt >= startOfPrevWeek && createdAt <= endOfPrevWeek;
        
      case DateFilterType.THIS_MONTH:
        const startOfCurrentMonth = startOfMonth(today);
        const endOfCurrentMonth = endOfMonth(today);
        return createdAt >= startOfCurrentMonth && createdAt <= endOfCurrentMonth;
        
      case DateFilterType.CUSTOM:
        if (dateRange.from && dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return createdAt >= dateRange.from && createdAt <= endDate;
        }
        return true;
        
      case DateFilterType.ALL:
      default:
        return true;
    }
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch = searchTerm ? 
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (opp.company && opp.company.toLowerCase().includes(searchTerm.toLowerCase())) :
        true;
      
      const matchesFunnel = filterFunnel ? opp.funnelId === filterFunnel : true;
      const matchesStage = filterStage ? opp.stageId === filterStage : true;
      const matchesClient = filterClient ? opp.client === filterClient : true;
      const matchesDate = applyDateFilter(opp);
      
      return matchesSearch && matchesFunnel && matchesStage && matchesClient && matchesDate;
    });
  }, [
    opportunities, 
    searchTerm, 
    filterFunnel, 
    filterStage, 
    filterClient, 
    dateFilter, 
    dateRange
  ]);

  return {
    filteredOpportunities,
    applyDateFilter
  };
};
