import React, { useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ListingItemType } from '@/lib/database.types';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useTranslations } from 'next-intl';
import { ListingViewModal } from './listing-view-modal';

interface ListingItemProps {
  listing: ListingItemType;
  images: string[];
  attributes?: Record<string, string | number | boolean>;
}

// Function to validate image URL
const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Format attribute value for display
// const formatAttributeValue = (value: any): string => {
//   if (value === null || value === undefined) return 'N/A';
//   if (typeof value === 'boolean') return value ? 'Yes' : 'No';
//   if (Array.isArray(value)) return value.join(', ');
//   return String(value);
// };

// Format date to DD.MM.YYYY
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return dateString;
  }
};

export function ListingItem({ listing, images, attributes = {} }: ListingItemProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const t = useTranslations('listings');

  // Format attribute names for display (convert snake_case or camelCase to Title Case)
  // const formatAttributeName = (name: string): string => {
  //   return name
  //     .replace(/_/g, ' ')
  //     .replace(/([A-Z])/g, ' $1')
  //     .replace(/^./, (str) => str.toUpperCase())
  //     .trim();
  // };

  // Arrange attributes in a logical order
  // const sortedAttributes = [
  //   // Important attributes first
  //   ...(attributes?.number_of_rooms ? [['number_of_rooms', attributes.number_of_rooms]] : []),
  //   ...(attributes?.living_area ? [['living_area', attributes.living_area]] : []),
  //   ...(attributes?.total_area ? [['total_area', attributes.total_area]] : []),
  //   ...(attributes?.floor ? [['floor', attributes.floor]] : []),

  //   // Then all other attributes sorted alphabetically
  //   ...Object.entries(attributes || {})
  //     .filter(([key]) => !['number_of_rooms', 'living_area', 'total_area', 'floor', 'housing_type', 'renovation'].includes(key))
  //     .sort(([a], [b]) => a.localeCompare(b))
  // ];

  return (
    <>
      <Card
        className="overflow-hidden h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setModalOpen(true)}
      >
        {images.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((imageUrl, index) => (
                <CarouselItem key={index}>
                  <AspectRatio ratio={16 / 9}>
                    {isValidImageUrl(imageUrl) && !imageErrors[index] ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imageUrl}
                          alt={`Image ${index + 1} of ${listing.title}`}
                          className="object-cover w-full h-full"
                          onError={() => setImageErrors(prev => ({ ...prev, [index]: true }))}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">{t('imageUnavailable')}</span>
                      </div>
                    )}
                  </AspectRatio>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        ) : (
          <AspectRatio ratio={16 / 9}>
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">{t('noImageAvailable')}</span>
            </div>
          </AspectRatio>
        )}

        <CardContent className="p-4 flex-grow">
          <h3 className="font-semibold text-lg mb-1">
            {attributes?.number_of_rooms && attributes?.floor && attributes?.building_floors && (
              <Badge variant="outline" className="text-sm mr-1">
                {attributes.number_of_rooms}/{attributes.floor}/{attributes.building_floors}
              </Badge>
            )}
            {listing.title}
          </h3>

          {/* Important Attributes */}
          <div className="mt-3">
            <div className="grid grid-cols-1 gap-1">
              {attributes?.total_area && (
                <div className="flex items-start text-xs">
                  <span className="text-muted-foreground min-w-[120px]">{t('totalArea')}:</span>
                  <span className="font-medium truncate">{attributes.total_area}m²</span>
                </div>
              )}
              {attributes?.building_type && (
                <div className="flex items-start text-xs">
                  <span className="text-muted-foreground min-w-[120px]">{t('buildingType')}:</span>
                  <span className="font-medium truncate">{attributes.building_type}</span>
                </div>
              )}
              {attributes?.housing_type && (
                <div className="flex items-start text-xs">
                  <span className="text-muted-foreground min-w-[120px]">{t('housingType')}:</span>
                  <span className="font-medium truncate">{attributes.housing_type}</span>
                </div>
              )}
              {attributes?.ad_type && (
                <div className="flex items-start text-xs">
                  <span className="text-muted-foreground min-w-[120px]">{t('adType')}:</span>
                  <span className="font-medium truncate">{attributes.ad_type}</span>
                </div>
              )}
              {listing.created_at && (
                <div className="flex items-start text-xs">
                  <span className="text-muted-foreground min-w-[120px]">{t('createdAt')}:</span>
                  <span className="font-medium truncate">{formatDate(listing.created_at)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between">
          <span className="font-medium text-primary">
            {listing.price ? `$${listing.price.toLocaleString()}` : t('priceOnRequest')}
          </span>

          {attributes?.district && (
            <Badge variant="outline" className="text-xs">
              {attributes.district}
            </Badge>
          )}
        </CardFooter>
      </Card>

      <ListingViewModal
        listingId={listing.id}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}