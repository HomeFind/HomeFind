// TODO [DEPRECATED]: This component has been replaced by StaticFiltersPanel
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { X, SearchIcon, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { AttributeFilter } from './attribute-filter';
import { AttributeFilter as AttributeFilterType } from '@/lib/database.types';
import { getAttributesWithOptions } from '@/lib/attributes';
import { useFilters } from './filter-context';
import { cn } from '@/lib/utils';

interface FiltersPanelProps {
  className?: string;
  onClose?: () => void;
  isOpen?: boolean;
}

// TODO [DEPRECATED]: This component has been replaced by StaticFiltersPanel
export function FiltersPanel({ className, onClose, isOpen = true }: FiltersPanelProps) {
  const { clearFilters, applyFilters, filters, pendingFilters } = useFilters();
  const [attributes, setAttributes] = useState<AttributeFilterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAttribute, setActiveAttribute] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // Filter attributes based on search
  const filteredAttributes = attributes.filter(attr => 
    attr.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        const attributesData = await getAttributesWithOptions(pendingFilters, activeAttribute);
        
        // Update all attributes with fresh data
        const filteredAttributes = attributesData.filter(attr => 
          ['ENUM', 'NUMBER', 'BOOLEAN'].includes(attr.type)
        );
        
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
        const attributesData = await getAttributesWithOptions([], undefined);
        
        // Update all attributes with fresh data
        const filteredAttributes = attributesData.filter(attr => 
          ['ENUM', 'NUMBER', 'BOOLEAN'].includes(attr.type)
        );
        
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

  const hasPendingFilters = pendingFilters.length > 0;
  const hasFilterChanges = JSON.stringify(filters) !== JSON.stringify(pendingFilters);
  const activeFilterCount = pendingFilters.length;

  return (
    <Card className={cn("overflow-hidden border-muted/60 shadow-sm", className)}>
      <CardHeader className="px-3 py-2 bg-background border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-1.5">
            <Settings2 className="h-4 w-4" />
            Property Filters
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <div className="px-3 py-2 border-b border-border/40">
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search filters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>
      
      {loading ? (
        <CardContent className="p-3">
          <div className="space-y-4 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-1/3 bg-muted rounded-md"></div>
                <div className="h-8 bg-muted/60 rounded-md"></div>
              </div>
            ))}
          </div>
        </CardContent>
      ) : (
        <ScrollArea className="h-[calc(100vh-12rem)] max-h-[450px]">
          <CardContent className="p-3">
            {filteredAttributes.length > 0 ? (
              <div className="space-y-4">
                {filteredAttributes.map((attribute) => (
                  <div 
                    key={attribute.code} 
                    className="mb-3 opacity-100 animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
                    style={{ animationDelay: `${filteredAttributes.indexOf(attribute) * 50}ms` }}
                    onFocus={() => handleAttributeInteraction(attribute.code)}
                    onClick={() => handleAttributeInteraction(attribute.code)}
                  >
                    <AttributeFilter 
                      attribute={attribute} 
                      onInteraction={() => handleAttributeInteraction(attribute.code)} 
                    />
                    {filteredAttributes.indexOf(attribute) < filteredAttributes.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-muted-foreground text-xs mb-1">No filters match your search</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </CardContent>
        </ScrollArea>
      )}
      
      <CardFooter className="p-3 bg-muted/10 border-t border-border/40 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearFilters}
          disabled={!hasPendingFilters}
          className="h-9 text-xs"
        >
          Reset
        </Button>
        <Button
          size="sm"
          onClick={handleApplyFilters}
          disabled={!hasFilterChanges}
          className="h-9 text-xs gap-1.5 relative"
        >
          Apply Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary-foreground text-primary rounded-full h-5 w-5 flex items-center justify-center text-[10px] font-medium">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 