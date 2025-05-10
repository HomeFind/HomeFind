import React, { useEffect, useState } from 'react';
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
  const { clearFilters, applyFilters, filters } = useFilters();
  const [attributes, setAttributes] = useState<AttributeFilterType[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch attributes on component mount
  useEffect(() => {
    const fetchAttributes = async () => {
      setLoading(true);
      try {
        const attributesData = await getAttributesWithOptions();
        // Filter only ENUM, NUMBER, and BOOLEAN attributes
        const filteredAttributes = attributesData.filter(attr => 
          ['ENUM', 'NUMBER', 'BOOLEAN'].includes(attr.type)
        );
        setAttributes(filteredAttributes);
      } catch (error) {
        console.error('Error fetching attributes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, []);

  const handleApplyFilters = () => {
    applyFilters();
    onClose?.();
  };

  // Skip rendering if panel is closed and not in mobile
  if (!isOpen) {
    return null;
  }

  const hasActiveFilters = filters.length > 0;

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
                <div key={attribute.code} className="mb-4">
                  <AttributeFilter attribute={attribute} />
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
          onClick={clearFilters}
          disabled={!hasActiveFilters}
        >
          Clear All
        </Button>
        <Button
          size="sm"
          onClick={handleApplyFilters}
          disabled={!hasActiveFilters}
        >
          Apply Filters
        </Button>
      </CardFooter>
    </Card>
  );
} 