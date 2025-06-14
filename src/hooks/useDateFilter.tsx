
import { useState, useMemo } from "react";
import { subDays, startOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";

// Enum para os filtros de data
export enum DateFilterType {
  ALL = "all",
  TODAY = "today",
  YESTERDAY = "yesterday",
  THIS_WEEK = "thisWeek",
  LAST_WEEK = "lastWeek",
  THIS_MONTH = "thisMonth",
  CUSTOM = "custom",
}

export interface DateFilterState {
  type: DateFilterType;
  dateRange: DateRange | undefined;
  label: string;
}

export function useDateFilter() {
  const [filter, setFilter] = useState<DateFilterState>({
    type: DateFilterType.ALL,
    dateRange: undefined,
    label: "Todas as datas"
  });

  // Aplicar filtro de data a uma data específica
  const isDateInFilter = (date: Date): boolean => {
    const checkDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filter.type) {
      case DateFilterType.TODAY:
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);
        return isWithinInterval(checkDate, { start: today, end: todayEnd });
        
      case DateFilterType.YESTERDAY:
        const yesterday = subDays(today, 1);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        return isWithinInterval(checkDate, { start: yesterday, end: yesterdayEnd });
        
      case DateFilterType.THIS_WEEK:
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Segunda-feira
        return checkDate >= startOfCurrentWeek && checkDate <= today;
        
      case DateFilterType.LAST_WEEK:
        const startOfPrevWeek = subDays(startOfWeek(today, { weekStartsOn: 1 }), 7);
        const endOfPrevWeek = subDays(startOfWeek(today, { weekStartsOn: 1 }), 1);
        return checkDate >= startOfPrevWeek && checkDate <= endOfPrevWeek;
        
      case DateFilterType.THIS_MONTH:
        const startOfCurrentMonth = startOfMonth(today);
        const endOfCurrentMonth = endOfMonth(today);
        return checkDate >= startOfCurrentMonth && checkDate <= endOfCurrentMonth;
        
      case DateFilterType.CUSTOM:
        if (filter.dateRange?.from && filter.dateRange?.to) {
          // Ajustar o fim do dia para incluir todas as oportunidades do dia final
          const endDate = new Date(filter.dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          return checkDate >= filter.dateRange.from && checkDate <= endDate;
        }
        return true;
        
      case DateFilterType.ALL:
      default:
        return true;
    }
  };

  // Filtrar um array de objetos com base na data
  const filterByDate = <T extends { [key: string]: any }>(
    items: T[],
    dateField: keyof T
  ): T[] => {
    if (filter.type === DateFilterType.ALL) return items;
    
    return items.filter(item => {
      const date = new Date(item[dateField] as string | number | Date);
      return isDateInFilter(date);
    });
  };

  // Retorna o texto do label do filtro atual
  const getFilterLabel = useMemo(() => {
    switch (filter.type) {
      case DateFilterType.TODAY:
        return "Hoje";
      case DateFilterType.YESTERDAY:
        return "Ontem";
      case DateFilterType.THIS_WEEK:
        return "Esta semana";
      case DateFilterType.LAST_WEEK:
        return "Semana passada";
      case DateFilterType.THIS_MONTH:
        return "Este mês";
      case DateFilterType.CUSTOM:
        if (filter.dateRange?.from && filter.dateRange?.to) {
          const formatDate = (date: Date) => {
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
          };
          return `${formatDate(filter.dateRange.from)} - ${formatDate(filter.dateRange.to)}`;
        }
        return "Personalizado";
      default:
        return "Todas as datas";
    }
  }, [filter.type, filter.dateRange]);

  // Atualiza o tipo de filtro
  const setFilterType = (type: DateFilterType) => {
    setFilter(prev => ({
      ...prev,
      type,
      dateRange: type !== DateFilterType.CUSTOM ? undefined : prev.dateRange,
      label: getFilterLabel
    }));
  };

  // Atualiza o intervalo de datas para filtro personalizado
  const setDateRange = (range: DateRange | undefined) => {
    setFilter(prev => ({
      ...prev,
      dateRange: range,
      type: DateFilterType.CUSTOM,
      label: getFilterLabel
    }));
  };

  return {
    filter,
    setFilterType,
    setDateRange,
    isDateInFilter,
    filterByDate,
    getFilterLabel
  };
}
