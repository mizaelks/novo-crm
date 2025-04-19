
import React from 'react';

const KanbanSkeleton = () => {
  return (
    <div className="p-4">
      <div className="h-6 w-48 bg-muted animate-pulse rounded mb-6" />
      <div className="flex space-x-4">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            className="w-80 h-96 bg-muted animate-pulse rounded" 
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanSkeleton;
