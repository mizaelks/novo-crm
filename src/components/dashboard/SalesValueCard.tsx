
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/services/utils/dateUtils";

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
      <CardHeader>
        <CardTitle className="text-lg">Valor das Vendas Realizadas</CardTitle>
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
          {filterLabel} • {totalSales} {totalSales === 1 ? 'venda realizada' : 'vendas realizadas'}
        </p>
      </CardContent>
    </Card>
  );
};

export default SalesValueCard;
