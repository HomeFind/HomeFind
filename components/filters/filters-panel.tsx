import React, { useEffect, useState } from 'react';
import { X, Sliders, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Group attributes by category (first word of attribute name)
  const groupedAttributes = attributes.reduce((groups, attribute) => {
    const category = attribute.name.split(' ')[0] || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(attribute);
    return groups;
  }, {} as Record<string, AttributeFilterType[]>);

  // Fetch attributes on component mount
  useEffect(() => {
    const fetchAttributes = async () => {
      setLoading(true);
      try {
        const attributesData = await getAttributesWithOptions();
        setAttributes(attributesData);
        
        // Initialize all categories as open
        const initialOpenState = attributesData.reduce((state, attribute) => {
          const category = attribute.name.split(' ')[0] || 'Other';
          state[category] = true;
          return state;
        }, {} as Record<string, boolean>);
        
        setOpenCategories(initialOpenState);
      } catch (error) {
        console.error('Error fetching attributes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, []);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

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
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      ) : (
        <ScrollArea className="h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
          <CardContent className="p-4">
            <div className="space-y-1">
              {Object.entries(groupedAttributes).map(([category, categoryAttributes]) => (
                <Collapsible
                  key={category}
                  open={openCategories[category]}
                  onOpenChange={() => toggleCategory(category)}
                  className="pt-2"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex justify-between p-2 h-auto font-medium"
                    >
                      {category}
                      {openCategories[category] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 px-2 pb-2">
                    {categoryAttributes.map((attribute) => (
                      <div key={attribute.code}>
                        <AttributeFilter attribute={attribute} />
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
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