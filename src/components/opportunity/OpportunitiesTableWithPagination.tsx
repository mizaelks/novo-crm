
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import OpportunitiesTable from "./OpportunitiesTable";
import { Opportunity } from "@/types";

interface OpportunitiesTableWithPaginationProps {
  opportunities: Opportunity[];
  getFunnelName: (funnelId: string) => string;
  getStageName: (stageId: string) => string;
  getStageAlertStatus: (opportunity: Opportunity) => boolean;
  showArchived: boolean;
  onArchive: (opportunity: Opportunity, archive: boolean) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  itemsPerPage?: number;
}

const OpportunitiesTableWithPagination = ({
  opportunities,
  getFunnelName,
  getStageName,
  getStageAlertStatus,
  showArchived,
  onArchive,
  onDelete,
  itemsPerPage = 10
}: OpportunitiesTableWithPaginationProps) => {
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
    totalItems,
    startIndex,
    endIndex
  } = usePagination({
    data: opportunities,
    itemsPerPage
  });

  return (
    <div className="space-y-4">
      <OpportunitiesTable
        opportunities={paginatedData}
        getFunnelName={getFunnelName}
        getStageName={getStageName}
        getStageAlertStatus={getStageAlertStatus}
        showArchived={showArchived}
        onArchive={onArchive}
        onDelete={onDelete}
      />
      
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        onNextPage={goToNextPage}
        onPreviousPage={goToPreviousPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
      />
    </div>
  );
};

export default OpportunitiesTableWithPagination;
