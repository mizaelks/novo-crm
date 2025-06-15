
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, User, Trophy, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Funnel } from "@/types";
import { useDateFilter, DateFilterType } from "@/hooks/useDateFilter";
import { useUsers } from "@/hooks/useUsers";
import DateRangePicker from "@/components/dashboard/DateRangePicker";

interface InsightsFiltersProps {
  funnels: Funnel[];
  selectedFunnel: string;
  onFunnelChange: (value: string) => void;
  selectedUser: string;
  onUserChange: (value: string) => void;
  selectedWinReason: string;
  onWinReasonChange: (value: string) => void;
  selectedLossReason: string;
  onLossReasonChange: (value: string) => void;
}

const InsightsFilters = ({ 
  funnels, 
  selectedFunnel, 
  onFunnelChange,
  selectedUser,
  onUserChange,
  selectedWinReason,
  onWinReasonChange,
  selectedLossReason,
  onLossReasonChange
}: InsightsFiltersProps) => {
  const { filter, setFilterType, setDateRange } = useDateFilter();
  const { users, loading: usersLoading } = useUsers();

  const handleDateRangeApply = () => {
    // Trigger data refresh when custom date range is applied
    console.log("Custom date range applied:", filter.dateRange);
  };

  // Get funnel type badge
  const getFunnelTypeBadge = () => {
    if (selectedFunnel === "all") {
      const types = [...new Set(funnels.map(f => f.funnelType))];
      if (types.length === 1) {
        return types[0] === 'venda' 
          ? <Badge variant="default" className="bg-green-100 text-green-800">Todos: Venda</Badge>
          : <Badge variant="secondary" className="bg-blue-100 text-blue-800">Todos: Relacionamento</Badge>;
      } else if (types.length > 1) {
        return <Badge variant="outline" className="border-purple-300 text-purple-700">Todos: Mistos</Badge>;
      }
      return <Badge variant="outline">Todos os Funis</Badge>;
    }
    
    const selectedFunnelData = funnels.find(f => f.id === selectedFunnel);
    if (!selectedFunnelData) return null;
    
    return selectedFunnelData.funnelType === 'venda'
      ? <Badge variant="default" className="bg-green-100 text-green-800">Funil de Venda</Badge>
      : <Badge variant="secondary" className="bg-blue-100 text-blue-800">Funil de Relacionamento</Badge>;
  };

  // Get all available win/loss reasons from selected funnel stages
  const getAvailableReasons = (type: 'win' | 'loss') => {
    const reasons = new Set<string>();
    
    const funnelsToCheck = selectedFunnel === "all" 
      ? funnels 
      : funnels.filter(f => f.id === selectedFunnel);
    
    funnelsToCheck.forEach(funnel => {
      funnel.stages.forEach(stage => {
        if (type === 'win' && stage.isWinStage && stage.winReasons) {
          stage.winReasons.forEach(reason => reasons.add(reason));
        } else if (type === 'loss' && stage.isLossStage && stage.lossReasons) {
          stage.lossReasons.forEach(reason => reasons.add(reason));
        }
      });
    });
    
    return Array.from(reasons);
  };

  const winReasons = getAvailableReasons('win');
  const lossReasons = getAvailableReasons('loss');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
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
          {getFunnelTypeBadge()}
        </div>

        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedUser} onValueChange={onUserChange} disabled={usersLoading}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os usuários" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">Todos os usuários</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}` 
                    : user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
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

        {filter.type === DateFilterType.CUSTOM && (
          <DateRangePicker
            date={filter.dateRange}
            setDate={setDateRange}
            onApply={handleDateRangeApply}
          />
        )}

        {winReasons.length > 0 && (
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-green-600" />
            <Select value={selectedWinReason} onValueChange={onWinReasonChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Motivo de vitória" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="all">Todos os motivos</SelectItem>
                {winReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {lossReasons.length > 0 && (
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-red-600" />
            <Select value={selectedLossReason} onValueChange={onLossReasonChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Motivo de perda" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="all">Todos os motivos</SelectItem>
                {lossReasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsFilters;
