
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
import { AlertCircle, Download } from "lucide-react";

interface ExportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFunnel: string;
  funnelType: 'venda' | 'relacionamento' | 'all' | 'mixed';
}

const ExportDataDialog = ({ open, onOpenChange, selectedFunnel, funnelType }: ExportDataDialogProps) => {
  const [includeOpportunities, setIncludeOpportunities] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeValues, setIncludeValues] = useState(true);
  const [includeSales, setIncludeSales] = useState(true);
  const [exportFormat, setExportFormat] = useState("csv");
  const [dateRange, setDateRange] = useState("current");

  // Determinar disponibilidade baseada no tipo de funil
  const hasMonetaryData = funnelType === 'venda' || funnelType === 'all' || funnelType === 'mixed';
  const hasSalesData = funnelType === 'venda' || funnelType === 'all' || funnelType === 'mixed';

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

  const getExportDescription = () => {
    switch (funnelType) {
      case 'venda':
        return "Dados incluem valores monetários e métricas de vendas";
      case 'relacionamento':
        return "Dados focam em oportunidades e relacionamentos (sem valores monetários)";
      case 'mixed':
        return "Dados incluem valores monetários apenas para funis de venda";
      case 'all':
      default:
        return "Dados combinam métricas de todos os tipos de funil disponíveis";
    }
  };

  const handleExport = () => {
    console.log("Exportando dados:", {
      includeOpportunities,
      includeMetrics,
      includeValues: hasMonetaryData ? includeValues : false,
      includeSales: hasSalesData ? includeSales : false,
      exportFormat,
      dateRange,
      funnelType,
      selectedFunnel
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Dados</DialogTitle>
          <DialogDescription>
            Selecione quais dados incluir na exportação.
          </DialogDescription>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Contexto:</span>
            {getFunnelTypeBadge()}
          </div>
          <p className="text-xs text-muted-foreground">{getExportDescription()}</p>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-sm font-medium">Dados para Exportar</Label>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="export-opportunities" className="text-sm">Lista de Oportunidades</Label>
              <Switch
                id="export-opportunities"
                checked={includeOpportunities}
                onCheckedChange={setIncludeOpportunities}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="export-metrics" className="text-sm">Métricas Gerais</Label>
              <Switch
                id="export-metrics"
                checked={includeMetrics}
                onCheckedChange={setIncludeMetrics}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="export-values" className="text-sm">Valores Monetários</Label>
                {!hasMonetaryData && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Indisponível para funis de relacionamento
                  </p>
                )}
              </div>
              <Switch
                id="export-values"
                checked={includeValues}
                onCheckedChange={setIncludeValues}
                disabled={!hasMonetaryData}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="export-sales" className="text-sm">Dados de Vendas</Label>
                {!hasSalesData && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Apenas funis de venda geram vendas
                  </p>
                )}
              </div>
              <Switch
                id="export-sales"
                checked={includeSales}
                onCheckedChange={setIncludeSales}
                disabled={!hasSalesData}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Formato de Exportação</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF (Relatório)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Período dos Dados</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Período Atual</SelectItem>
                  <SelectItem value="all">Todos os Dados</SelectItem>
                  <SelectItem value="custom">Período Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Dados
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDataDialog;
