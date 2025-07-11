# Supabase Database Documentation - HomeFind Project

## Executive Summary

The HomeFind database implements a flexible Entity-Attribute-Value (EAV) pattern for managing property listings with unlimited custom attributes. The system features:

- **7 database tables** with a modern EAV architecture
- **Automated migration system** from legacy to new structure via triggers
- **Sophisticated filtering** through optimized PostgreSQL functions
- **Public read access** with Row Level Security (RLS) enabled
- **Performance optimizations** including specialized indexes and temporary tables

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Core Tables](#core-tables)
3. [Database Functions](#database-functions)
4. [Triggers & Automation](#triggers--automation)
5. [Security Configuration](#security-configuration)
6. [Performance Optimizations](#performance-optimizations)
7. [Current Implementation Status](#current-implementation-status)
8. [Migration Strategy](#migration-strategy)
9. [Integration Guidelines](#integration-guidelines)
10. [Maintenance & Best Practices](#maintenance--best-practices)

## Database Architecture

### Design Pattern: Entity-Attribute-Value (EAV)

The database uses an EAV pattern to provide unlimited flexibility for property attributes:

```
listing_items (Entity) ←→ listing_attribute_values (Value) ←→ attributes (Attribute)
                                      ↑
                                      |
                               attribute_options (Enumerations)
```

**Benefits:**
- Add new property features without schema changes
- Handle diverse property types (apartments, houses, commercial)
- Support multiple data types per attribute
- Enable dynamic filtering across all attributes

### Data Flow Architecture

1. **Legacy Integration**: The `listings` table receives data from external sources
2. **Automated Migration**: Triggers convert legacy data to EAV structure
3. **API Layer**: PostgreSQL functions provide clean interfaces for the application
4. **Frontend Access**: Next.js app uses RPC functions for all data operations

## Core Tables

### 1. listing_items
**Purpose**: Core normalized table for property listings

| Column | Type | Description |
|--------|------|-------------|
| id | bigint (PK) | Auto-generated identifier |
| slug | varchar (UNIQUE) | URL-friendly identifier |
| price | numeric | Property price |
| title | varchar | Listing title |
| description | text | Detailed description |
| currency | text | Currency code |
| created_at | timestamptz | Creation timestamp |
| updated_at | timestamptz | Last update timestamp |

**Security**: RLS enabled with public read access

### 2. attributes
**Purpose**: Defines available property attributes

| Column | Type | Description |
|--------|------|-------------|
| id | bigint (PK) | Unique identifier |
| attribute_code | varchar (UNIQUE) | Machine-readable code |
| attribute_name | varchar | Human-readable name |
| data_type | varchar | NUMBER, VARCHAR, DATE, BOOLEAN, ENUM |
| is_enumeration | boolean | Uses predefined options |
| is_multiple | boolean | Allows multiple values |

**Key Attributes Examples:**
- `bedrooms` (NUMBER)
- `property_type` (ENUM: Studio, 1BR, 2BR, etc.)
- `has_parking` (BOOLEAN)
- `available_date` (DATE)

### 3. listing_attribute_values
**Purpose**: Stores actual attribute values (the "Value" in EAV)

| Column | Type | Description |
|--------|------|-------------|
| lav_id | bigint (PK) | Unique identifier |
| listing_id | bigint (FK) | References listing_items |
| attribute_id | bigint (FK) | References attributes |
| value_number | numeric | For NUMBER attributes |
| value_varchar | varchar | For VARCHAR attributes |
| value_date | date | For DATE attributes |
| value_boolean | boolean | For BOOLEAN attributes |
| option_id | bigint (FK) | For ENUM attributes |

**Design Note**: Only one value column is populated per row based on the attribute's data_type

### 4. attribute_options
**Purpose**: Predefined options for ENUM-type attributes

| Column | Type | Description |
|--------|------|-------------|
| id | bigint (PK) | Unique identifier |
| attribute_id | bigint (FK) | References attributes |
| option_value | varchar | The option text |

**Constraint**: Unique on (attribute_id, option_value)

### 5. listings (Legacy)
**Purpose**: Denormalized legacy table with fixed columns
- Contains 30+ columns for specific property attributes
- Still receives data from external sources
- Automatically synced to EAV structure via triggers
- Scheduled for deprecation

### 6. firecrawl_accounts
**Purpose**: Web scraping service integration
- Manages API credentials and usage limits
- Not currently used in frontend

### 7. listing_fails
**Purpose**: Error logging for failed imports
- Tracks failed listing imports with error details
- Useful for debugging data ingestion issues

## Database Functions

### Core API Functions

#### get_listings(filter_json, page_number, page_size)
**Purpose**: Primary function for retrieving filtered and paginated listings

**Parameters:**
- `filter_json`: Array of filter objects `[{attributeCode, value}, ...]`
- `page_number`: Page number (default: 1)
- `page_size`: Results per page (default: 20)

**Returns:**
```json
{
  "total": 150,
  "page": 1,
  "page_size": 20,
  "total_pages": 8,
  "data": [
    {
      "id": 1,
      "title": "Modern Apartment",
      "price": 250000,
      "images": ["url1", "url2"],
      "attributes": {
        "bedrooms": 2,
        "property_type": "Apartment",
        "has_parking": true
      }
    }
  ]
}
```

**Key Features:**
- Uses temporary tables for efficient filtering
- Handles all attribute data types
- Includes parsed images
- Optimized pagination

#### get_filtered_attributes(filter_json)
**Purpose**: Returns available attribute options based on current filters

**Returns**: Attributes with their available values after filtering
- For ENUM: Available options
- For NUMBER: Min/max range
- For BOOLEAN: Available true/false values

**Use Case**: Dynamic filter UI that updates options based on selections

### Utility Functions

#### parse_images(image_value)
Converts various image formats to consistent JSONB array

#### get_attribute_range(attr_code)
Returns min/max values for numeric attributes

### Migration Functions

#### fn_listings_to_eav()
**Type**: Trigger function
**Purpose**: Automatically migrates data from legacy `listings` table to EAV structure

**Key Behaviors:**
- Syncs core fields to `listing_items`
- Extracts all dynamic attributes to `listing_attribute_values`
- Creates attribute_options on-the-fly for new ENUM values
- Handles both INSERT and UPDATE operations
- Cleans up removed attributes on UPDATE

## Triggers & Automation

### Active Triggers

1. **trg_listings_to_eav**
   - Table: `listings`
   - Event: AFTER INSERT
   - Action: Migrates new listings to EAV structure

2. **listings_touch_updated_at**
   - Table: `listings`
   - Event: BEFORE UPDATE
   - Action: Updates timestamp

### Automation Benefits

- **Zero-downtime migration**: Legacy and new systems coexist
- **Data consistency**: Automatic synchronization between structures
- **Self-healing**: Creates missing attribute options automatically
- **Audit trail**: Maintains creation and update timestamps

## Security Configuration

### Row Level Security (RLS) Status

| Table | RLS Enabled | Policy |
|-------|-------------|---------|
| listing_items | ✅ | Public read |
| attributes | ✅ | Public read |
| attribute_options | ✅ | Public read |
| listing_attribute_values | ✅ | Public read |
| firecrawl_accounts | ✅ | Restricted |
| listings | ❌ | None |
| listing_fails | ❌ | None |

### Security Recommendations

1. Enable RLS on all tables
2. Implement write policies for authenticated users
3. Add user authentication system
4. Create role-based access controls
5. Audit sensitive operations

## Performance Optimizations

### Indexing Strategy

1. **Primary Keys**: All tables have efficient B-tree indexes
2. **Foreign Keys**: All FK columns are indexed for join performance
3. **Unique Constraints**: Compound indexes on (attribute_id, option_value)
4. **Array Operations**: GIN indexes on `listings.amenities` and `listings.images`
5. **Full-text Search**: GIN index on `listings.title` and `listings.district`
6. **Range Queries**: B-tree index on price columns

### Query Optimization Techniques

1. **Temporary Tables**: Functions use `temp_filtered_listings` to avoid repeated joins
2. **JSONB Aggregation**: Single-query attribute fetching prevents N+1 problems
3. **Lazy Loading**: Images parsed only when needed
4. **Efficient Filtering**: Direct table queries for core attributes like price
5. **Batch Operations**: Trigger processes all attributes in one pass

## Current Implementation Status

### Frontend Integration

**Active Features:**
- ✅ Read-only property browsing
- ✅ Advanced filtering system
- ✅ Pagination
- ✅ Dynamic filter updates
- ✅ Image display

**Not Implemented:**
- ❌ User authentication
- ❌ Property creation/editing
- ❌ Admin panel
- ❌ Saved searches
- ❌ Contact system

### Database Utilization

**Used in Production:**
- `listing_items` - Core listing data
- `attributes` - Via RPC functions
- `attribute_options` - For filter options
- `listing_attribute_values` - For property details

**Not Used:**
- `listings` - Legacy table (data source only)
- `firecrawl_accounts` - Web scraping not integrated
- `listing_fails` - Error logging not implemented

## Migration Strategy

### Current State
1. External systems write to `listings` table
2. Triggers automatically sync to EAV structure
3. Frontend reads only from EAV tables via functions

### Migration Path
1. **Phase 1** (Current): Dual-write system with triggers
2. **Phase 2**: Migrate data sources to write directly to EAV
3. **Phase 3**: Deprecate `listings` table
4. **Phase 4**: Remove migration triggers

### Migration Benefits
- No downtime required
- Gradual transition possible
- Rollback capability maintained
- Data integrity preserved

## Integration Guidelines

### TypeScript Integration
```typescript
// Generate types
npm run supabase:types

// Use RPC functions
const { data } = await supabase
  .rpc('get_listings', {
    filter_json: filters,
    page_number: 1,
    page_size: 20
  });
```

### Filter Format
```javascript
const filters = [
  { attributeCode: 'price', value: [100000, 500000] },
  { attributeCode: 'bedrooms', value: [2, 3] },
  { attributeCode: 'property_type', value: ['Apartment', 'Condo'] },
  { attributeCode: 'has_parking', value: true }
];
```

### Best Practices
1. Always use RPC functions instead of direct table queries
2. Implement proper error handling for RPC calls
3. Cache attribute metadata on the frontend
4. Use pagination for large result sets
5. Validate filter inputs before sending to database

## Maintenance & Best Practices

### Regular Maintenance Tasks
1. **Monitor Performance**
   - Check slow query logs
   - Analyze function execution times
   - Review index usage statistics

2. **Data Cleanup**
   - Archive old entries from `listing_fails`
   - Remove orphaned attribute values
   - Update `firecrawl_accounts` credits

3. **Schema Evolution**
   - Add new attributes via `attributes` table
   - Update RPC functions for new features
   - Version control all schema changes

### Development Guidelines
1. **Adding New Attributes**
   - Insert into `attributes` table
   - Define appropriate data_type
   - Add options for ENUM types
   - No schema migration needed

2. **Performance Monitoring**
   ```sql
   -- Check function performance
   SELECT * FROM pg_stat_user_functions
   WHERE funcname LIKE 'get_%';
   
   -- Analyze index usage
   SELECT * FROM pg_stat_user_indexes
   WHERE schemaname = 'public';
   ```

3. **Data Integrity Checks**
   ```sql
   -- Find listings without attributes
   SELECT l.* FROM listing_items l
   LEFT JOIN listing_attribute_values lav ON l.id = lav.listing_id
   WHERE lav.listing_id IS NULL;
   
   -- Check for invalid attribute values
   SELECT * FROM listing_attribute_values
   WHERE (value_number IS NOT NULL)::int +
         (value_varchar IS NOT NULL)::int +
         (value_date IS NOT NULL)::int +
         (value_boolean IS NOT NULL)::int +
         (option_id IS NOT NULL)::int > 1;
   ```

### Future Enhancements
1. **Materialized Views**: For complex aggregations
2. **Partitioning**: For large listing tables
3. **Real-time Subscriptions**: Using Supabase Realtime
4. **Full-text Search**: Enhanced search capabilities
5. **Geospatial Features**: PostGIS integration for map-based search