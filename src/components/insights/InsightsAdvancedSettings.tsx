
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

const InsightsAdvancedSettings = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportData = () => {
    console.log("Exportando dados dos insights...");
    // Implementar exportação futuramente
  };

  const handleChartSettings = () => {
    console.log("Configurações de gráficos...");
    // Implementar configurações de gráficos futuramente
  };

  const handleMetricsSettings = () => {
    console.log("Configurações de métricas...");
    // Implementar configurações de métricas futuramente
  };

  const handleDatePresets = () => {
    console.log("Configurar presets de data...");
    // Implementar presets personalizados futuramente
  };

  return (
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
  );
};

export default InsightsAdvancedSettings;
