import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ExternalLink, Phone, Calendar, MapPin, DollarSign, Ruler, Building, Home, Tag, User, FileText } from 'lucide-react';
import { getListingDetails, ListingDetails } from '@/lib/listings';
import { useTranslations } from 'next-intl';

interface ListingViewModalProps {
  listingId: number | null;
  open: boolean;
  onClose: () => void;
}

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

const formatPrice = (price: number | null, currency: string | null, t: (key: string) => string): string => {
  if (!price) return t('priceOnRequest');
  const formatted = price.toLocaleString();
  return currency ? `${formatted} ${currency}` : `$${formatted}`;
};

const generateOlxUrl = (slug: string): string => {
  return `https://www.olx.uz/d/obyavlenie/${slug}`;
};

export function ListingViewModal({ listingId, open, onClose }: ListingViewModalProps) {
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const t = useTranslations('listings');

  const fetchListingDetails = useCallback(async () => {
    if (!listingId) return;

    setLoading(true);
    try {
      const data = await getListingDetails(listingId);
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing details:', error);
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    if (open && listingId) {
      fetchListingDetails();
    }
  }, [open, listingId, fetchListingDetails]);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    setCurrent(carouselApi.selectedScrollSnap());

    carouselApi.on('select', () => {
      setCurrent(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  if (!open) return null;

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <VisuallyHidden>{t('loading')}</VisuallyHidden>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-[calc(90vh-8rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
              <p className="mt-6 text-lg text-muted-foreground">{t('loading')}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!listing) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <VisuallyHidden>{t('listingNotFound')}</VisuallyHidden>
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-muted-foreground">{t('listingNotFound')}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden>{listing.title}</VisuallyHidden>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Images Carousel */}
          {listing.images.length > 0 && (
            <div className="space-y-4">
              <Carousel className="w-full" setApi={setCarouselApi}>
                <CarouselContent>
                  {listing.images.map((imageUrl, index) => (
                    <CarouselItem key={index}>
                      <AspectRatio ratio={16 / 9}>
                        {!imageErrors[index] ? (
                          <img
                            src={imageUrl}
                            alt={`Image ${index + 1} of ${listing.title}`}
                            className="object-cover rounded-lg w-full h-full"
                            onError={() => handleImageError(index)}
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
                            <span className="text-muted-foreground">{t('imageUnavailable')}</span>
                          </div>
                        )}
                      </AspectRatio>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {listing.images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                )}
              </Carousel>

              {/* Carousel Dots */}
              {listing.images.length > 1 && (
                <div className="flex justify-center gap-2">
                  {listing.images.map((_, index) => (
                    <button
                      key={index}
                      className={`h-2 w-2 rounded-full transition-all ${current === index
                          ? 'bg-primary w-6'
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                      onClick={() => carouselApi?.scrollTo(index)}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title and Room Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{listing.title}</h2>
            </div>

            {/* Number of rooms, floor, building floors */}
            {listing.attributes.number_of_rooms && listing.attributes.floor && listing.attributes.building_floors && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{listing.attributes.number_of_rooms}</div>
                  <div className="text-sm text-muted-foreground">{t('rooms')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{listing.attributes.floor}</div>
                  <div className="text-sm text-muted-foreground">{t('floor')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{listing.attributes.building_floors}</div>
                  <div className="text-sm text-muted-foreground">{t('totalFloors')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('propertyDetails')}</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {t('price')}:
                  </span>
                  <span className="font-medium text-primary">
                    {formatPrice(listing.price, listing.attributes.currency as string, t)}
                  </span>
                </div>

                {listing.attributes.total_area && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      {t('totalArea')}:
                    </span>
                    <span className="font-medium">{listing.attributes.total_area}m²</span>
                  </div>
                )}

                {listing.attributes.year_built && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t('yearBuilt')}:
                    </span>
                    <span className="font-medium">{listing.attributes.year_built}</span>
                  </div>
                )}

                {listing.attributes.district && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {t('district')}:
                    </span>
                    <span className="font-medium">{listing.attributes.district}</span>
                  </div>
                )}

                {listing.attributes.building_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {t('buildingType')}:
                    </span>
                    <span className="font-medium">{listing.attributes.building_type}</span>
                  </div>
                )}

                {listing.attributes.housing_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      {t('housingType')}:
                    </span>
                    <span className="font-medium">{listing.attributes.housing_type}</span>
                  </div>
                )}

                {listing.attributes.ad_type && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {t('adType')}:
                    </span>
                    <span className="font-medium">{listing.attributes.ad_type}</span>
                  </div>
                )}

                {listing.attributes.layout && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      {t('layout')}:
                    </span>
                    <span className="font-medium">{listing.attributes.layout}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('createdAt')}:
                  </span>
                  <span className="font-medium">{formatDate(listing.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Column 2 - Moderator Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('contactInfo')}</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="contact-person"
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {t('authorName')}:
                  </label>
                  <Input
                    id="contact-person"
                    value={listing.details.author_name || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact-phone"
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {t('authorPhone')}:
                  </label>
                  <Input
                    id="contact-phone"
                    value={listing.details.author_phone || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact-notes"
                    className="text-sm text-muted-foreground flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {t('notes')}:
                  </label>
                  <Textarea
                    id="contact-notes"
                    value={listing.details.notes || ''}
                    readOnly
                    className="bg-muted min-h-[120px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => window.open(generateOlxUrl(listing.slug), '_blank')}
              className="flex-1 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('viewOnOlx')}
            </Button>

            {listing.attributes.author_phone && (
              <Button
                onClick={() => window.open(`tel:${listing.attributes.author_phone}`, '_self')}
                className="flex-1 cursor-pointer"
              >
                <Phone className="w-4 h-4 mr-2" />
                {t('call')} {listing.attributes.author_phone}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}