
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { formatCurrency } from "@/services/utils/dateUtils";
import { HelpCircle } from "lucide-react";

interface SalesValueCardProps {
  salesValue: number;
  totalSales: number;
  filterLabel: string;
  loading: boolean;
  className?: string;
}

const SalesValueCard = ({ 
  salesValue, 
  totalSales, 
  filterLabel, 
  loading,
  className 
}: SalesValueCardProps) => {
  if (totalSales === 0) return null;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Valor das Vendas Realizadas</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Valor total das vendas concluídas apenas de funis de venda</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-green-600">
          {loading ? (
            <div className="h-10 w-32 bg-muted animate-pulse rounded" />
          ) : (
            formatCurrency(salesValue)
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {filterLabel} • {totalSales} {totalSales === 1 ? 'venda realizada' : 'vendas realizadas'} • Apenas funis de venda
        </p>
      </CardContent>
    </Card>
  );
};

export default SalesValueCard;
