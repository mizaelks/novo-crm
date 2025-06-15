
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileSpreadsheet, AlertCircle } from "lucide-react";

interface ExportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFunnel: string;
  funnelType: 'venda' | 'relacionamento' | 'all' | 'mixed';
}

const ExportDataDialog = ({ open, onOpenChange, selectedFunnel, funnelType }: ExportDataDialogProps) => {
  const [exportFormat, setExportFormat] = useState("csv");
  const [includeCharts, setIncludeCharts] = useState(false);
  const [includeMetrics, setIncludeMetrics] = useState(true);
  const [includeConversion, setIncludeConversion] = useState(true);
  const [includeDistribution, setIncludeDistribution] = useState(true);
  const [includeTimeSeries, setIncludeTimeSeries] = useState(true);
  const [includeMonetaryData, setIncludeMonetaryData] = useState(true);

  // Determinar disponibilidade de dados baseado no tipo de funil
  const shouldShowMonetaryData = funnelType === 'venda' || funnelType === 'all' || funnelType === 'mixed';
  const shouldShowSalesData = funnelType === 'venda' || funnelType === 'all' || funnelType === 'mixed';

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

  const getTimeSeriesLabel = () => {
    switch (funnelType) {
      case 'venda':
        return 'Série Temporal (Valores)';
      case 'relacionamento':
        return 'Série Temporal (Oportunidades)';
      case 'mixed':
      case 'all':
      default:
        return 'Série Temporal (Métricas)';
    }
  };

  const handleExport = () => {
    const exportData = {
      format: exportFormat,
      includeCharts,
      funnelType,
      selectedFunnel,
      data: {
        metrics: includeMetrics,
        conversion: includeConversion && shouldShowSalesData,
        distribution: includeDistribution,
        timeSeries: includeTimeSeries,
        monetaryData: includeMonetaryData && shouldShowMonetaryData
      }
    };

    console.log("Iniciando exportação:", exportData);
    
    // Simular download do arquivo
    const timestamp = new Date().toISOString().split('T')[0];
    const funnelSuffix = selectedFunnel === "all" ? "todos-funis" : "funil-especifico";
    const filename = `insights-export-${funnelSuffix}-${timestamp}.${exportFormat}`;
    
    // Aqui seria implementada a lógica real de exportação
    alert(`Arquivo ${filename} será baixado em breve!`);
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Dados</DialogTitle>
          <DialogDescription>
            Escolha o formato e os dados que deseja exportar.
          </DialogDescription>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-muted-foreground">Contexto atual:</span>
            {getFunnelTypeBadge()}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Formato de Exportação</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center">
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      CSV (Excel)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      JSON
                    </div>
                  </SelectItem>
                  <SelectItem value="pdf">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      PDF (Relatório)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <Label className="text-sm font-medium">Dados para Exportar</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metrics"
                  checked={includeMetrics}
                  onCheckedChange={(checked) => setIncludeMetrics(checked as boolean)}
                />
                <Label htmlFor="metrics" className="text-sm">Métricas Principais</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="conversion"
                  checked={includeConversion}
                  onCheckedChange={(checked) => setIncludeConversion(checked as boolean)}
                  disabled={!shouldShowSalesData}
                />
                <div className="space-y-1">
                  <Label htmlFor="conversion" className="text-sm">Dados de Conversão</Label>
                  {!shouldShowSalesData && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Apenas funis de venda têm dados de conversão
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="distribution"
                  checked={includeDistribution}
                  onCheckedChange={(checked) => setIncludeDistribution(checked as boolean)}
                />
                <Label htmlFor="distribution" className="text-sm">Distribuição por Estágios</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="timeseries"
                  checked={includeTimeSeries}
                  onCheckedChange={(checked) => setIncludeTimeSeries(checked as boolean)}
                />
                <Label htmlFor="timeseries" className="text-sm">{getTimeSeriesLabel()}</Label>
              </div>

              {shouldShowMonetaryData && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="monetary"
                    checked={includeMonetaryData}
                    onCheckedChange={(checked) => setIncludeMonetaryData(checked as boolean)}
                  />
                  <Label htmlFor="monetary" className="text-sm">Dados Monetários</Label>
                </div>
              )}
              
              {exportFormat === "pdf" && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="charts"
                    checked={includeCharts}
                    onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                  />
                  <Label htmlFor="charts" className="text-sm">Incluir Gráficos</Label>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDataDialog;
