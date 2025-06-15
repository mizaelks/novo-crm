
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  currentValue: number;
  previousValue: number;
  isPercentage?: boolean;
  isCurrency?: boolean;
}

const TrendIndicator = ({ 
  currentValue, 
  previousValue, 
  isPercentage = false,
  isCurrency = false 
}: TrendIndicatorProps) => {
  const calculatePercentageChange = () => {
    if (previousValue === 0) return currentValue > 0 ? 100 : 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  const percentageChange = calculatePercentageChange();
  const isPositive = percentageChange > 0;
  const isNeutral = percentageChange === 0;

  const formatValue = (value: number) => {
    if (isCurrency) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    if (isPercentage) {
      return `${value.toFixed(1)}%`;
    }
    return value.toString();
  };

  if (isNeutral) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span className="text-xs">Sem alteração</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-1",
      isPositive ? "text-green-600" : "text-red-600"
    )}>
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span className="text-xs font-medium">
        {isPositive ? '+' : ''}{percentageChange.toFixed(1)}%
      </span>
    </div>
  );
};

export default TrendIndicator;
