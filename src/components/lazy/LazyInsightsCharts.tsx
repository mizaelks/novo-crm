
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const InsightsCharts = lazy(() => import('@/components/insights/InsightsCharts'));

const InsightsChartsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);

interface LazyInsightsChartsProps {
  stageDistribution: any[];
  valueOverTime: any[];
  selectedFunnel?: string;
  funnelType?: 'venda' | 'relacionamento' | 'all' | 'mixed';
}

export const LazyInsightsCharts = (props: LazyInsightsChartsProps) => {
  return (
    <Suspense fallback={<InsightsChartsSkeleton />}>
      <InsightsCharts {...props} />
    </Suspense>
  );
};
