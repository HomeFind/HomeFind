'use client';

import React, { Suspense } from 'react';
import { FilterProvider } from '@/components/filters/override-filter-context';
import { FiltersPanel } from '@/components/filters';
import { AppliedFilters } from '@/components/filters/applied-filters';
import { Skeleton } from '@/components/ui/skeleton';

// Loading component to display while suspense is resolving
function FiltersLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="mb-6 h-8 w-48 bg-muted rounded"></div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-6 w-3/4 bg-muted rounded"></div>
            <div className="h-20 bg-muted/30 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FiltersPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Property Filters</h1>
      <p className="text-muted-foreground mb-8">
        Explore our property filters to narrow down your search.
      </p>
      
      <Suspense fallback={<FiltersLoading />}>
        <FilterProvider>
          <div className="max-w-xl mx-auto">
            <AppliedFilters />
            <FiltersPanel />
          </div>
        </FilterProvider>
      </Suspense>
    </div>
  );
} 