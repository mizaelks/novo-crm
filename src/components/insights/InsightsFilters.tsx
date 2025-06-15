
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from "lucide-react";
import { Funnel } from "@/types";
import { useDateFilter, DateFilterType } from "@/hooks/useDateFilter";

interface InsightsFiltersProps {
  funnels: Funnel[];
  selectedFunnel: string;
  onFunnelChange: (value: string) => void;
}

const InsightsFilters = ({ funnels, selectedFunnel, onFunnelChange }: InsightsFiltersProps) => {
  const { filter, setFilterType } = useDateFilter();

  return (
    <div className="flex items-center gap-4">
      <Select value={selectedFunnel} onValueChange={onFunnelChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Selecionar funil" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectItem value="all">Todos os funis</SelectItem>
          {funnels.map((funnel) => (
            <SelectItem key={funnel.id} value={funnel.id}>
              {funnel.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <Select value={filter.type} onValueChange={(value) => setFilterType(value as DateFilterType)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar por período" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectItem value={DateFilterType.ALL}>Vitalício</SelectItem>
            <SelectItem value={DateFilterType.TODAY}>Hoje</SelectItem>
            <SelectItem value={DateFilterType.THIS_WEEK}>Esta semana</SelectItem>
            <SelectItem value={DateFilterType.THIS_MONTH}>Este mês</SelectItem>
            <SelectItem value={DateFilterType.CUSTOM}>Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default InsightsFilters;
