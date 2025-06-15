
import { lazy, Suspense } from 'react';
import KanbanSkeleton from '@/components/kanban/KanbanSkeleton';

const KanbanBoard = lazy(() => import('@/components/kanban/KanbanBoard'));

interface LazyKanbanBoardProps {
  funnelId: string;
}

export const LazyKanbanBoard = ({ funnelId }: LazyKanbanBoardProps) => {
  return (
    <Suspense fallback={<KanbanSkeleton />}>
      <KanbanBoard funnelId={funnelId} />
    </Suspense>
  );
};
