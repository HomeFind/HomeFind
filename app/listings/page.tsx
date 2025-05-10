'use client';

import React, { useEffect, useState, useRef } from 'react';
import { FiltersPanel, FilterProvider, MobileFilterDialog, useFilters, AppliedFilters } from '@/components/filters';
import { ListingItem } from '@/components/listing-item';
import { getListingsWithImages } from '@/lib/listings';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FilterValue } from '@/lib/database.types';

function ListingsContent() {
  const { filters } = useFilters();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Array<{
    listing: any,
    images: string[],
    attributes: Record<string, any>
  }>>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    totalPages: 0
  });
  
  // Track filters in a ref to detect changes
  const filtersRef = useRef<FilterValue[]>([]);
  // Track if initial fetch has been done
  const initialFetchDoneRef = useRef(false);

  // Initial fetch on component mount
  useEffect(() => {
    if (!initialFetchDoneRef.current) {
      console.log('Performing initial fetch of listings');
      fetchListings(1);
      initialFetchDoneRef.current = true;
      filtersRef.current = [...filters];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch listings whenever filters change
  useEffect(() => {
    // Skip the initial render since we have a separate effect for that
    if (!initialFetchDoneRef.current) return;
    
    // Convert filters to JSON string for comparison
    const currentFiltersJson = JSON.stringify(filters);
    const previousFiltersJson = JSON.stringify(filtersRef.current);
    
    // Only fetch if filters have changed - deep comparison
    if (currentFiltersJson !== previousFiltersJson) {
      console.log('Filters changed, fetching new listings:', filters);
      fetchListings(1);
      // Update the ref with current filters
      filtersRef.current = JSON.parse(currentFiltersJson);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchListings = async (page: number) => {
    setLoading(true);
    try {
      console.log('Fetching listings with filters:', filters);
      
      // Check if filters is a valid array
      if (!Array.isArray(filters)) {
        console.error('Filters is not an array:', filters);
        throw new Error('Invalid filters format');
      }
      
      const result = await getListingsWithImages(filters, page);
      console.log('Fetched listings result:', result);
      
      if (!result.listings) {
        console.error('No listings data returned');
        throw new Error('No listings data returned');
      }
      
      setListings(result.listings);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error fetching listings:', error);
      // Set empty listings to prevent UI errors
      setListings([]);
      setPagination({
        total: 0,
        currentPage: 1,
        totalPages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchListings(newPage);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Property Listings</h1>
        
        {/* Mobile Filter Button - Opens filter dialog on mobile */}
        <div className="md:hidden">
          <MobileFilterDialog />
        </div>
      </div>
      
      {/* Applied Filters and Listing Count */}
      <AppliedFilters listingCount={pagination.total} loading={loading} />
      
      {loading ? (
        // Skeleton loader while listings are being fetched
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg shadow-sm border overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : listings.length > 0 ? (
        <>
          {/* Display actual listings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(({ listing, images, attributes }) => (
              <ListingItem 
                key={listing.id} 
                listing={listing} 
                images={images} 
                attributes={attributes}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <div className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : (
        // No listings found message
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No listings found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your filters to find what you're looking for.
          </p>
        </div>
      )}
    </>
  );
}

export default function ListingsPage() {
  return (
    <div className="container mx-auto py-8">
      <FilterProvider>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filter Panel - Visible on desktop */}
          <div className="hidden md:block w-full md:w-80 shrink-0">
            <FiltersPanel />
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            <ListingsContent />
          </div>
        </div>
      </FilterProvider>
    </div>
  );
} 