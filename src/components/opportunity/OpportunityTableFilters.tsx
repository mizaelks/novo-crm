
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Funnel, Stage } from "@/types";
import { DateFilterType, DateRange } from "@/hooks/useDateFilter";
import { Search, CalendarIcon, Users, Download } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface OpportunityTableFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterFunnel: string;
  setFilterFunnel: (value: string) => void;
  filterStage: string;
  setFilterStage: (value: string) => void;
  filterClient: string;
  setFilterClient: (value: string) => void;
  dateFilter: DateFilterType;
  setDateFilter: (value: DateFilterType) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  showUniqueClients: boolean;
  setShowUniqueClients: (value: boolean) => void;
  funnels: Funnel[];
  availableStages: Stage[];
  uniqueClients: string[];
  onExport?: () => void;
}

const OpportunityTableFilters = ({
  searchTerm,
  setSearchTerm,
  filterFunnel,
  setFilterFunnel,
  filterStage,
  setFilterStage,
  filterClient,
  setFilterClient,
  dateFilter,
  setDateFilter,
  dateRange,
  setDateRange,
  showUniqueClients,
  setShowUniqueClients,
  funnels,
  availableStages,
  uniqueClients,
  onExport
}: OpportunityTableFiltersProps) => {

  const getDateFilterLabel = () => {
    switch (dateFilter) {
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
        return dateRange.from && dateRange.to
          ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
          : "Personalizado";
      default:
        return "Todas as datas";
    }
  };

  const handleDateRangeSelect = (range: DateRange | any) => {
    setDateRange(range);
  };

  const activeFiltersCount = [
    searchTerm,
    filterFunnel,
    filterStage,
    filterClient,
    dateFilter !== DateFilterType.ALL
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Filtros</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
          <Button 
            variant={showUniqueClients ? "default" : "outline"}
            size="sm"
            onClick={() => setShowUniqueClients(!showUniqueClients)}
          >
            <Users className="h-4 w-4 mr-2" />
            {showUniqueClients ? "Ver oportunidades" : "Ver clientes"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div>
          <Select value={filterFunnel} onValueChange={value => {
            setFilterFunnel(value === "all" ? "" : value);
            setFilterStage(""); // Reset stage filter when funnel changes
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecionar funil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os funis</SelectItem>
              {funnels.map(funnel => (
                <SelectItem key={funnel.id} value={funnel.id}>
                  {funnel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select 
            value={filterStage} 
            onValueChange={value => setFilterStage(value === "all" ? "" : value)}
            disabled={!filterFunnel}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecionar etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as etapas</SelectItem>
              {availableStages.map(stage => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={filterClient} onValueChange={value => setFilterClient(value === "all" ? "" : value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecionar cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {uniqueClients.map(client => (
                <SelectItem key={client} value={client}>
                  {client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getDateFilterLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 border-b">
                <div className="space-y-2">
                  {Object.values(DateFilterType).map((type) => (
                    <Button
                      key={type}
                      variant={dateFilter === type ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        setDateFilter(type);
                        if (type !== DateFilterType.CUSTOM) {
                          setDateRange({ from: undefined, to: undefined });
                        }
                      }}
                    >
                      {type === DateFilterType.ALL && "Todas as datas"}
                      {type === DateFilterType.TODAY && "Hoje"}
                      {type === DateFilterType.YESTERDAY && "Ontem"}
                      {type === DateFilterType.THIS_WEEK && "Esta semana"}
                      {type === DateFilterType.LAST_WEEK && "Semana passada"}
                      {type === DateFilterType.THIS_MONTH && "Este mês"}
                      {type === DateFilterType.CUSTOM && "Personalizado"}
                    </Button>
                  ))}
                </div>
              </div>
              {dateFilter === DateFilterType.CUSTOM && (
                <div className="p-3">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateRangeSelect}
                    numberOfMonths={1}
                    locale={pt}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default OpportunityTableFilters;
