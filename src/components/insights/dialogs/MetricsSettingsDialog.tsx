
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface MetricsSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFunnel: string;
  funnelType: 'venda' | 'relacionamento' | 'all' | 'mixed';
}

const MetricsSettingsDialog = ({ open, onOpenChange, selectedFunnel, funnelType }: MetricsSettingsDialogProps) => {
  const [showTotalOpportunities, setShowTotalOpportunities] = useState(true);
  const [showTotalValue, setShowTotalValue] = useState(true);
  const [showTotalSales, setShowTotalSales] = useState(true);
  const [showSalesValue, setShowSalesValue] = useState(true);
  const [showAverageTicket, setShowAverageTicket] = useState(true);
  const [showConversionRate, setShowConversionRate] = useState(true);
  const [currency, setCurrency] = useState("BRL");
  const [numberFormat, setNumberFormat] = useState("default");

  // Determinar quais métricas são aplicáveis baseado no tipo de funil
  const shouldShowMonetaryMetrics = funnelType === 'venda' || funnelType === 'all' || funnelType === 'mixed';
  const shouldShowSalesMetrics = funnelType === 'venda' || funnelType === 'all' || funnelType === 'mixed';

  const getFunnelTypeBadge = () => {
    switch (funnelType) {
      case 'venda':
        return <Badge variant="default" className="bg-green-100 text-green-800">Funil de Venda</Badge>;
      case 'relacionamento':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Funil de Relacionamento</Badge>;
      case 'mixed':
        return <Badge variant="outline">Funis Mistos</Badge>;
      case 'all':
      default:
        return <Badge variant="outline">Todos os Funis</Badge>;
    }
  };

  const handleSave = () => {
    console.log("Salvando configurações de métricas:", {
      showTotalOpportunities,
      showTotalValue,
      showTotalSales,
      showSalesValue,
      showAverageTicket,
      showConversionRate,
      currency,
      numberFormat,
      funnelType,
      selectedFunnel
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações de Métricas</DialogTitle>
          <DialogDescription>
            Personalize quais métricas são exibidas e como são formatadas.
          </DialogDescription>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Contexto atual:</span>
            {getFunnelTypeBadge()}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Métricas Visíveis</Label>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="total-opp" className="text-sm">Total de Oportunidades</Label>
              <Switch
                id="total-opp"
                checked={showTotalOpportunities}
                onCheckedChange={setShowTotalOpportunities}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="total-value" className="text-sm">Valor Total</Label>
                {!shouldShowMonetaryMetrics && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Indisponível para funis de relacionamento
                  </p>
                )}
              </div>
              <Switch
                id="total-value"
                checked={showTotalValue}
                onCheckedChange={setShowTotalValue}
                disabled={!shouldShowMonetaryMetrics}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="total-sales" className="text-sm">Vendas Realizadas</Label>
                {!shouldShowSalesMetrics && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Apenas funis de venda geram vendas
                  </p>
                )}
              </div>
              <Switch
                id="total-sales"
                checked={showTotalSales}
                onCheckedChange={setShowTotalSales}
                disabled={!shouldShowSalesMetrics}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sales-value" className="text-sm">Valor de Vendas</Label>
                {!shouldShowSalesMetrics && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Apenas funis de venda geram vendas
                  </p>
                )}
              </div>
              <Switch
                id="sales-value"
                checked={showSalesValue}
                onCheckedChange={setShowSalesValue}
                disabled={!shouldShowSalesMetrics || !shouldShowMonetaryMetrics}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="avg-ticket" className="text-sm">Ticket Médio</Label>
                {!shouldShowSalesMetrics && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Apenas funis de venda geram vendas
                  </p>
                )}
              </div>
              <Switch
                id="avg-ticket"
                checked={showAverageTicket}
                onCheckedChange={setShowAverageTicket}
                disabled={!shouldShowSalesMetrics || !shouldShowMonetaryMetrics}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="conversion" className="text-sm">Taxa de Conversão</Label>
                {!shouldShowSalesMetrics && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Apenas funis de venda têm conversão
                  </p>
                )}
              </div>
              <Switch
                id="conversion"
                checked={showConversionRate}
                onCheckedChange={setShowConversionRate}
                disabled={!shouldShowSalesMetrics}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Moeda</Label>
              <Select 
                value={currency} 
                onValueChange={setCurrency} 
                disabled={!shouldShowMonetaryMetrics}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real (R$)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
              {!shouldShowMonetaryMetrics && (
                <p className="text-xs text-muted-foreground">
                  Configurações de moeda não se aplicam a funis de relacionamento
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Formato dos Números</Label>
              <Select value={numberFormat} onValueChange={setNumberFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão (1.234.567)</SelectItem>
                  <SelectItem value="compact">Compacto (1,2M)</SelectItem>
                  <SelectItem value="full">Completo (1.234.567,00)</SelectItem>
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

export default MetricsSettingsDialog;
