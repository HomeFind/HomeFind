import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AttributeFilter } from './attribute-filter';
import { AttributeFilter as AttributeFilterType } from '@/lib/database.types';
import { getAttributesWithOptions } from '@/lib/attributes';
import { useFilters } from './filter-context';

interface FiltersPanelProps {
  className?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

export function FiltersPanel({ className, onClose, isOpen = true }: FiltersPanelProps) {
  const { clearFilters, applyFilters, filters, pendingFilters } = useFilters();
  const [attributes, setAttributes] = useState<AttributeFilterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAttribute, setActiveAttribute] = useState<string | undefined>(undefined);
  const [shouldApplyFilters, setShouldApplyFilters] = useState(false);
  
  // Use a ref to track if we should fetch new attributes
  const shouldFetchRef = useRef(true);
  const pendingFiltersRef = useRef(pendingFilters);

  // Initial fetch and when filters are explicitly applied
  useEffect(() => {
    if (shouldFetchRef.current) {
      const fetchAttributes = async () => {
        setLoading(true);
        try {
          const attributesData = await getAttributesWithOptions(filters, activeAttribute);
          // Filter only ENUM, NUMBER, and BOOLEAN attributes
          const filteredAttributes = attributesData.filter(attr => 
            ['ENUM', 'NUMBER', 'BOOLEAN'].includes(attr.type)
          );
          setAttributes(filteredAttributes);
          pendingFiltersRef.current = [...filters];
        } catch (error) {
          console.error('Error fetching attributes:', error);
        } finally {
          setLoading(false);
          shouldFetchRef.current = false;
        }
      };

      fetchAttributes();
    }
  }, [filters, activeAttribute]);

  // Only refresh options for the active attribute when interacting
  const handleAttributeInteraction = useCallback((attributeCode: string) => {
    setActiveAttribute(attributeCode);
    
    // Only refresh attribute options when explicitly interacting
    const fetchAttributeOptions = async () => {
      try {
        const attributesData = await getAttributesWithOptions(pendingFiltersRef.current, attributeCode);
        
        // Update only the active attribute while preserving others
        setAttributes(prevAttributes => {
          const newAttributes = [...prevAttributes];
          
          // Find and update the active attribute
          const activeAttributeData = attributesData.find(attr => attr.code === attributeCode);
          if (activeAttributeData) {
            const index = newAttributes.findIndex(attr => attr.code === attributeCode);
            if (index !== -1) {
              newAttributes[index] = activeAttributeData;
            }
          }
          
          return newAttributes;
        });
      } catch (error) {
        console.error('Error fetching attribute options:', error);
      }
    };
    
    fetchAttributeOptions();
  }, []);

  // Apply filters function that's called manually
  const handleApplyFilters = useCallback(() => {
    // Mark that we should fetch fresh attributes on next render
    shouldFetchRef.current = true;
    
    // Force a complete refresh of attributes after applying filters
    const applyAndRefresh = async () => {
      // First apply the filters to update the global state
      applyFilters();
      
      // Then explicitly fetch fresh attributes with the new filters
      try {
        setLoading(true);
        console.log('Fetching fresh attributes after filter application...');
        const attributesData = await getAttributesWithOptions(pendingFilters, activeAttribute);
        
        // Update all attributes with fresh data
        const filteredAttributes = attributesData.filter(attr => 
          ['ENUM', 'NUMBER', 'BOOLEAN'].includes(attr.type)
        );
        
        console.log('Received fresh attributes:', filteredAttributes);
        setAttributes(filteredAttributes);
        pendingFiltersRef.current = [...pendingFilters];
      } catch (error) {
        console.error('Error fetching fresh attributes:', error);
      } finally {
        setLoading(false);
      }
      
      // If needed, close the panel
      onClose?.();
    };
    
    applyAndRefresh();
  }, [applyFilters, pendingFilters, activeAttribute, onClose]);

  // Handle clearing filters
  const handleClearFilters = useCallback(() => {
    // Mark that we should fetch fresh attributes on next render
    shouldFetchRef.current = true;
    
    // Clear filters and then refresh attributes
    const clearAndRefresh = async () => {
      // First clear the filters
      clearFilters();
      
      // Then fetch fresh attributes with no filters
      try {
        setLoading(true);
        console.log('Fetching fresh attributes after clearing filters...');
        const attributesData = await getAttributesWithOptions([], undefined);
        
        // Update all attributes with fresh data
        const filteredAttributes = attributesData.filter(attr => 
          ['ENUM', 'NUMBER', 'BOOLEAN'].includes(attr.type)
        );
        
        console.log('Received fresh attributes after clearing:', filteredAttributes);
        setAttributes(filteredAttributes);
        pendingFiltersRef.current = [];
      } catch (error) {
        console.error('Error fetching fresh attributes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    clearAndRefresh();
  }, [clearFilters]);

  // Skip rendering if panel is closed and not in mobile
  if (!isOpen) {
    return null;
  }

  const hasActiveFilters = filters.length > 0;
  const hasPendingFilters = pendingFilters.length > 0;
  const hasFilterChanges = JSON.stringify(filters) !== JSON.stringify(pendingFilters);

  return (
    <Card className={`overflow-hidden shadow-md ${className}`}>
      <CardHeader className="px-4 py-3 bg-muted/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Filters
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      {loading ? (
        <CardContent className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      ) : (
        <ScrollArea className="h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
          <CardContent className="p-4">
            <div className="space-y-4">
              {attributes.map((attribute) => (
                <div 
                  key={attribute.code} 
                  className="mb-4"
                  onFocus={() => handleAttributeInteraction(attribute.code)}
                  onClick={() => handleAttributeInteraction(attribute.code)}
                >
                  <AttributeFilter 
                    attribute={attribute} 
                    onInteraction={() => handleAttributeInteraction(attribute.code)} 
                  />
                  {attributes.indexOf(attribute) < attributes.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </ScrollArea>
      )}
      
      <CardFooter className="px-4 py-3 bg-muted/50 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          disabled={!hasPendingFilters}
        >
          Clear All
        </Button>
        <Button
          size="sm"
          onClick={handleApplyFilters}
          disabled={!hasFilterChanges}
        >
          Apply Filters
        </Button>
      </CardFooter>
    </Card>
  );
} 