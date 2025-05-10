import React, { useState } from 'react';
import Image from 'next/image';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ListingItemType } from '@/lib/database.types';

interface ListingItemProps {
  listing: ListingItemType;
  images: string[];
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

export function ListingItem({ listing, images }: ListingItemProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get the first valid image URL or null
  const imageUrl = images.length > 0 && isValidImageUrl(images[0]) && !imageError
    ? images[0]
    : null;

  return (
    <Card className="overflow-hidden">
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
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{listing.title}</h3>
        {listing.description && (
          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
            {listing.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <span className="font-medium text-primary">
          {listing.price ? `$${listing.price.toLocaleString()}` : 'Price on request'}
        </span>
      </CardFooter>
    </Card>
  );
} 