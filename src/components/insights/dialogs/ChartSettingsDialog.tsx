
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface ChartSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFunnel: string;
  funnelType: 'venda' | 'relacionamento' | 'all' | 'mixed';
}

const ChartSettingsDialog = ({ open, onOpenChange, selectedFunnel, funnelType }: ChartSettingsDialogProps) => {
  const [showConversionChart, setShowConversionChart] = useState(true);
  const [showDistributionChart, setShowDistributionChart] = useState(true);
  const [showValueChart, setShowValueChart] = useState(true);
  const [chartTheme, setChartTheme] = useState("default");
  const [animationSpeed, setAnimationSpeed] = useState("normal");

  // Determinar labels e disponibilidade baseado no tipo de funil
  const getTimeSeriesLabel = () => {
    switch (funnelType) {
      case 'venda':
        return 'Valor ao Longo do Tempo';
      case 'relacionamento':
        return 'Oportunidades ao Longo do Tempo';
      case 'mixed':
        return 'Métricas Mistas ao Longo do Tempo';
      case 'all':
      default:
        return 'Métricas ao Longo do Tempo';
    }
  };

  const getFunnelTypeBadge = () => {
    switch (funnelType) {
      case 'venda':
        return <Badge variant="default" className="bg-green-100 text-green-800">Funil de Venda</Badge>;
      case 'relacionamento':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Funil de Relacionamento</Badge>;
      case 'mixed':
        return <Badge variant="outline" className="border-purple-300 text-purple-700">Funis Mistos</Badge>;
      case 'all':
      default:
        return <Badge variant="outline">Todos os Funis</Badge>;
    }
  };

  const getTimeSeriesDescription = () => {
    switch (funnelType) {
      case 'venda':
        return 'Mostra valores monetários para funis de venda';
      case 'relacionamento':
        return 'Mostra contagem de oportunidades para funis de relacionamento';
      case 'mixed':
        return 'Mostra valores monetários para funis de venda e contagem para relacionamento';
      case 'all':
      default:
        return 'Combina métricas de todos os tipos de funil disponíveis';
    }
  };

  const shouldShowPassThroughCharts = selectedFunnel !== "all";

  const handleSave = () => {
    console.log("Salvando configurações de gráficos:", {
      showConversionChart,
      showDistributionChart,
      showValueChart,
      chartTheme,
      animationSpeed,
      funnelType,
      selectedFunnel
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações de Gráficos</DialogTitle>
          <DialogDescription>
            Personalize a exibição dos gráficos nos insights.
          </DialogDescription>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Contexto atual:</span>
            {getFunnelTypeBadge()}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Gráficos Visíveis</Label>
            
            {shouldShowPassThroughCharts && (
              <div className="flex items-center justify-between">
                <Label htmlFor="conversion-chart" className="text-sm">Gráfico de Conversão</Label>
                <Switch
                  id="conversion-chart"
                  checked={showConversionChart}
                  onCheckedChange={setShowConversionChart}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Label htmlFor="distribution-chart" className="text-sm">Distribuição por Estágios</Label>
              <Switch
                id="distribution-chart"
                checked={showDistributionChart}
                onCheckedChange={setShowDistributionChart}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="value-chart" className="text-sm">{getTimeSeriesLabel()}</Label>
                <p className="text-xs text-muted-foreground">
                  {getTimeSeriesDescription()}
                </p>
              </div>
              <Switch
                id="value-chart"
                checked={showValueChart}
                onCheckedChange={setShowValueChart}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Tema dos Gráficos</Label>
              <Select value={chartTheme} onValueChange={setChartTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                  <SelectItem value="colorful">Colorido</SelectItem>
                  <SelectItem value="minimal">Minimalista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Velocidade da Animação</Label>
              <Select value={animationSpeed} onValueChange={setAnimationSpeed}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a velocidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Lenta</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Rápida</SelectItem>
                  <SelectItem value="none">Sem Animação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChartSettingsDialog;
