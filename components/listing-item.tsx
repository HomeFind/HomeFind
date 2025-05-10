import React, { useState } from 'react';
import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ListingItemType } from '@/lib/database.types';
import { Badge } from '@/components/ui/badge';

interface ListingItemProps {
  listing: ListingItemType;
  images: string[];
  attributes?: Record<string, any>;
}

// Function to validate image URL
const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Format attribute value for display
const formatAttributeValue = (value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
};

export function ListingItem({ listing, images, attributes = {} }: ListingItemProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get the first valid image URL or null
  const imageUrl = images.length > 0 && isValidImageUrl(images[0]) && !imageError
    ? images[0]
    : null;

  // Format attribute names for display (convert snake_case or camelCase to Title Case)
  const formatAttributeName = (name: string): string => {
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Arrange attributes in a logical order
  const sortedAttributes = [
    // Important attributes first
    ...(attributes?.number_of_rooms ? [['number_of_rooms', attributes.number_of_rooms]] : []),
    ...(attributes?.living_area ? [['living_area', attributes.living_area]] : []),
    ...(attributes?.total_area ? [['total_area', attributes.total_area]] : []),
    ...(attributes?.floor ? [['floor', attributes.floor]] : []),
    
    // Then all other attributes sorted alphabetically
    ...Object.entries(attributes || {})
      .filter(([key]) => !['number_of_rooms', 'living_area', 'total_area', 'floor', 'housing_type', 'renovation'].includes(key))
      .sort(([a], [b]) => a.localeCompare(b))
  ];

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <AspectRatio ratio={16/9}>
        {imageUrl ? (
          // Use unoptimized for external images to avoid the Image Optimization API
          <div className="relative w-full h-full">
            <img
              src={imageUrl}
              alt={`Image of ${listing.title}`}
              className="object-cover w-full h-full"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
      </AspectRatio>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
        {listing.description && (
          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
            {listing.description}
          </p>
        )}
        
        {/* Important Attributes */}
        <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
          {attributes?.number_of_rooms && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Rooms:</span>
              <span className="text-sm font-medium">{attributes.number_of_rooms}</span>
            </div>
          )}
          
          {attributes?.living_area && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Living area:</span>
              <span className="text-sm font-medium">{attributes.living_area}m²</span>
            </div>
          )}
          
          {attributes?.total_area && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Total:</span>
              <span className="text-sm font-medium">{attributes.total_area}m²</span>
            </div>
          )}
          
          {attributes?.floor && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Floor:</span>
              <span className="text-sm font-medium">{attributes.floor}</span>
            </div>
          )}
        </div>
        
        {/* All Other Attributes */}
        {sortedAttributes.length > 0 && (
          <div className="mt-3">
            <div className="grid grid-cols-1 gap-1">
              {sortedAttributes.map(([key, value]) => (
                <div key={key} className="flex items-start text-xs">
                  <span className="text-muted-foreground min-w-[120px]">{formatAttributeName(key)}:</span>
                  <span className="font-medium truncate">{formatAttributeValue(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <span className="font-medium text-primary">
          {listing.price ? `$${listing.price.toLocaleString()}` : 'Price on request'}
        </span>
        
        {/* Display a few important badges */}
        <div className="flex gap-1 flex-wrap justify-end">
          {attributes?.housing_type && (
            <Badge variant="outline" className="text-xs">
              {attributes.housing_type}
            </Badge>
          )}
          {attributes?.renovation && (
            <Badge variant="outline" className="text-xs">
              {attributes.renovation}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 