
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Control } from "react-hook-form";
import { SortingOption } from "@/types/taskTemplates";

interface StageSortingConfigProps {
  control: Control<any>;
  sortConfig: { type: SortingOption; enabled: boolean };
  onSortConfigChange: (config: { type: SortingOption; enabled: boolean }) => void;
}

export const StageSortingConfig = ({ 
  control, 
  sortConfig, 
  onSortConfigChange 
}: StageSortingConfigProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Ordenação automática</FormLabel>
        <Switch
          checked={sortConfig.enabled}
          onCheckedChange={(enabled) => 
            onSortConfigChange({ ...sortConfig, enabled })
          }
        />
      </div>
      
      {sortConfig.enabled && (
        <div className="space-y-2">
          <FormLabel className="text-sm">Tipo de ordenação</FormLabel>
          <Select
            value={sortConfig.type}
            onValueChange={(type: SortingOption) => 
              onSortConfigChange({ ...sortConfig, type })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Livre (padrão)</SelectItem>
              <SelectItem value="urgency">Por urgência (+ atrasado)</SelectItem>
              <SelectItem value="priority">Por prioridade (+ alertas)</SelectItem>
            </SelectContent>
          </Select>
          
          <p className="text-xs text-muted-foreground">
            {sortConfig.type === 'urgency' && "Oportunidades com mais atraso aparecem primeiro"}
            {sortConfig.type === 'priority' && "Oportunidades com mais alertas aparecem primeiro"}
            {sortConfig.type === 'free' && "Ordenação manual pelo usuário"}
          </p>
        </div>
      )}
    </div>
  );
};
