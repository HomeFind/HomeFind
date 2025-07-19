import { supabase } from './supabase';
import { FilterValue, ListingItemType } from './database.types';


interface ListingResult {
  id: number;
  title: string;
  price: number | null;
  description: string | null;
  slug: string;
  created_at: string;
  updated_at: string;
  images: string[];
  attributes: Record<string, string | number | boolean>;
}

interface PaginatedListingsResult {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  data: ListingResult[];
}

export interface ListingDetails {
  id: number;
  slug: string;
  price: number | null;
  title: string;
  images: string[];
  attributes: Record<string, string | number | boolean>;
  details: {
    author_name: string | null;
    author_phone: string | null;
    notes: string | null;
  };
  created_at: string;
  updated_at: string;
  description: string | null;
}

export interface ContactInfoData {
  author_name?: string;
  author_phone?: string;
  notes?: string;
}

export interface ContactInfoResponse {
  id: number;
  listing_item_id: number;
  author_name: string | null;
  author_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
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
    attributes: Record<string, string | number | boolean>
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

  // Log the raw result for debugging
  console.log('Raw database result:', result);

  // Handle case where data might be null or undefined
  if (!result || !result.data) {
    console.log('No data found or result is null, returning empty result');
    return {
      listings: [],
      pagination: { total: 0, currentPage: page, totalPages: 0 }
    };
  }

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
      total: result.total ?? 0,
      currentPage: result.page ?? page,
      totalPages: result.total_pages ?? 0
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
 * Fetch a single listing with all details using the show_listing database function
 */
export async function getListingDetails(listingId: number): Promise<ListingDetails | null> {
  const { data, error } = await supabase.rpc('show_listing', {
    listing_item_id: listingId
  });

  if (error) {
    console.error('Error fetching listing details:', error);
    return null;
  }

  return data;
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

/**
 * Save contact information for a listing
 */
export async function saveListingContactInfo(
  listingItemId: number,
  contactData: ContactInfoData
): Promise<ContactInfoResponse | null> {
  const { data, error } = await supabase
    .from('listing_details')
    .upsert(
      {
        listing_item_id: listingItemId,
        author_name: contactData.author_name || null,
        author_phone: contactData.author_phone || null,
        notes: contactData.notes || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'listing_item_id',
        ignoreDuplicates: false,
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting contact info:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    return null;
  }

  return data;
}