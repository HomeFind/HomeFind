import { supabase } from './supabase';
import { AttributeFilter, FilterValue, ListingItemType } from './database.types';

// Cache for attribute ID to avoid multiple lookups
let imageAttributeIdCache: number | null = null;

interface ListingResult {
  id: number;
  title: string;
  price: number | null;
  description: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
  images: string[];
  attributes: Record<string, any>;
}

interface PaginatedListingsResult {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  data: ListingResult[];
}

/**
 * Fetch listings with their attributes and apply filters using the database procedure
 */
export async function getListingsWithImages(
  filters: FilterValue[] = [], 
  page: number = 1,
  pageSize: number = 20
): Promise<{
  listings: Array<{ 
    listing: ListingItemType, 
    images: string[],
    attributes: Record<string, any>
  }>,
  pagination: { total: number, currentPage: number, totalPages: number }
}> {
  // Convert filters to the format expected by the procedure
  const filterJson = filters.map(filter => ({
    attributeCode: filter.attributeCode,
    value: filter.value
  }));

  // Log the filters being sent to the database
  console.log('Sending filters to database:', JSON.stringify(filterJson));

  // Call the procedure
  const { data, error } = await supabase.rpc('get_listings', {
    filter_json: filterJson.length > 0 ? filterJson : null,
    page_number: page,
    page_size: pageSize
  });

  if (error) {
    console.error('Error fetching listings:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    return {
      listings: [],
      pagination: { total: 0, currentPage: page, totalPages: 0 }
    };
  }

  // Parse the result
  const result = data as PaginatedListingsResult;
  
  // Transform into the expected format
  const listings = result.data.map(item => ({
    listing: {
      id: item.id,
      title: item.title,
      price: item.price,
      description: item.description,
      slug: item.slug,
      created_at: item.created_at,
      updated_at: item.updated_at
    } as ListingItemType,
    images: item.images || [],
    attributes: item.attributes || {}
  }));

  return {
    listings,
    pagination: {
      total: result.total,
      currentPage: result.page,
      totalPages: result.total_pages
    }
  };
}

/**
 * Fetch images for a single listing (legacy - use getListingsWithImages instead)
 */
export async function getListingImages(listingId: number): Promise<string[]> {
  // This is now handled by the database procedure, but keeping for compatibility
  const { listings } = await getListingsWithImages([{ 
    attributeCode: 'id', 
    value: listingId 
  }]);
  
  const listing = listings.find(item => item.listing.id === listingId);
  return listing?.images || [];
}

/**
 * Get the attribute ID for images
 */
async function getImagesAttributeId(): Promise<number | null> {
  // Return from cache if available
  if (imageAttributeIdCache !== null) {
    return imageAttributeIdCache;
  }

  const { data, error } = await supabase
    .from('attributes')
    .select('id')
    .eq('attribute_code', 'images')
    .single();
  
  if (error || !data) {
    console.error('Error finding images attribute:', error);
    return null;
  }
  
  // Cache the ID for future use
  imageAttributeIdCache = data.id;
  return data.id;
}

/**
 * Parse image values from string
 */
function parseImageValues(valueString: string): string[] {
  try {
    // First try to parse as JSON
    const parsed = JSON.parse(valueString);
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (typeof parsed === 'string') {
      // Single image as string
      return [parsed];
    }
  } catch (e) {
    // If not JSON, treat as comma-separated or single URL
    return valueString.split(',').map((url: string) => url.trim());
  }
  
  return [];
}

/**
 * Fetch listings with optional filters
 */
export async function getListings(filters: FilterValue[] = []) {
  // Start with a query for all listings
  let query = supabase
    .from('listing_items')
    .select('*')
    .order('created_at', { ascending: false });
  
  // Apply filters if any
  if (filters.length > 0) {
    // This is a simplified example - in a real app, you'd need more complex query building
    // based on the filter types and relationships
    for (const filter of filters) {
      // Example of how you might filter - this would need to be adapted to your schema
      // and actual filtering requirements
      if (filter.attributeCode === 'price' && Array.isArray(filter.value)) {
        const [min, max] = filter.value as [number, number];
        if (min > 0) query = query.gte('price', min);
        if (max < Infinity) query = query.lte('price', max);
      }
      
      // Add more filter handling here based on your needs
    }
  }
  
  const { data: listings, error } = await query;
  
  if (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
  
  return listings || [];
} 