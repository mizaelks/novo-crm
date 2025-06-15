
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, BarChart3, TrendingUp, Calendar, Download } from "lucide-react";
import ChartSettingsDialog from "./dialogs/ChartSettingsDialog";
import MetricsSettingsDialog from "./dialogs/MetricsSettingsDialog";
import DatePresetsDialog from "./dialogs/DatePresetsDialog";
import ExportDataDialog from "./dialogs/ExportDataDialog";

interface InsightsAdvancedSettingsProps {
  selectedFunnel: string;
  funnelType: 'venda' | 'relacionamento' | 'all' | 'mixed';
}

const InsightsAdvancedSettings = ({ selectedFunnel, funnelType }: InsightsAdvancedSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chartSettingsOpen, setChartSettingsOpen] = useState(false);
  const [metricsSettingsOpen, setMetricsSettingsOpen] = useState(false);
  const [datePresetsOpen, setDatePresetsOpen] = useState(false);
  const [exportDataOpen, setExportDataOpen] = useState(false);

  const handleChartSettings = () => {
    setIsOpen(false);
    setChartSettingsOpen(true);
  };

  const handleMetricsSettings = () => {
    setIsOpen(false);
    setMetricsSettingsOpen(true);
  };

  const handleDatePresets = () => {
    setIsOpen(false);
    setDatePresetsOpen(true);
  };

  const handleExportData = () => {
    setIsOpen(false);
    setExportDataOpen(true);
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Configurações avançadas">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border shadow-md">
          <DropdownMenuLabel>Configurações Avançadas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleChartSettings}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Configurar Gráficos
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleMetricsSettings}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Configurar Métricas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDatePresets}>
            <Calendar className="mr-2 h-4 w-4" />
            Presets de Data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Dados
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChartSettingsDialog
        open={chartSettingsOpen}
        onOpenChange={setChartSettingsOpen}
        selectedFunnel={selectedFunnel}
        funnelType={funnelType}
      />
      
      <MetricsSettingsDialog
        open={metricsSettingsOpen}
        onOpenChange={setMetricsSettingsOpen}
        selectedFunnel={selectedFunnel}
        funnelType={funnelType}
      />
      
      <DatePresetsDialog
        open={datePresetsOpen}
        onOpenChange={setDatePresetsOpen}
      />
      
      <ExportDataDialog
        open={exportDataOpen}
        onOpenChange={setExportDataOpen}
        selectedFunnel={selectedFunnel}
        funnelType={funnelType}
      />
    </>
  );
};

export default InsightsAdvancedSettings;
