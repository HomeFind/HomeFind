'use client';

import React, { Suspense } from 'react';
import { FilterProvider } from '@/components/filters/override-filter-context';
import { FiltersPanel } from '@/components/filters';
import { AppliedFilters } from '@/components/filters/applied-filters';
import { Skeleton } from '@/components/ui/skeleton';

// Loading component to display while suspense is resolving
function FiltersLoading() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-5 w-1/2 bg-muted rounded"></div>
          <div className="h-16 bg-muted/30 rounded-md"></div>
        </div>
      ))}
    </div>
  );
}

export default function FiltersPage() {
  return (
    <div className="p-3 max-w-[100vw] overflow-x-hidden">
      <Suspense fallback={<FiltersLoading />}>
        <FilterProvider>
          <div className="w-full">
            <AppliedFilters />
            <FiltersPanel className="shadow-sm" />
          </div>
        </FilterProvider>
      </Suspense>
    </div>
  );
} 