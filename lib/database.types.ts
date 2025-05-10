export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      attributes: {
        Row: {
          id: number
          attribute_code: string
          attribute_name: string
          data_type: 'NUMBER' | 'VARCHAR' | 'DATE' | 'BOOLEAN' | 'ENUM'
          is_enumeration: boolean
          is_multiple: boolean
        }
        Insert: {
          id?: number
          attribute_code: string
          attribute_name: string
          data_type: 'NUMBER' | 'VARCHAR' | 'DATE' | 'BOOLEAN' | 'ENUM'
          is_enumeration?: boolean
          is_multiple?: boolean
        }
        Update: {
          id?: number
          attribute_code?: string
          attribute_name?: string
          data_type?: 'NUMBER' | 'VARCHAR' | 'DATE' | 'BOOLEAN' | 'ENUM'
          is_enumeration?: boolean
          is_multiple?: boolean
        }
      }
      attribute_options: {
        Row: {
          id: number
          attribute_id: number
          option_value: string
        }
        Insert: {
          id?: number
          attribute_id: number
          option_value: string
        }
        Update: {
          id?: number
          attribute_id?: number
          option_value?: string
        }
      }
      listing_items: {
        Row: {
          id: number
          slug: string
          price: number | null
          title: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          slug: string
          price?: number | null
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          slug?: string
          price?: number | null
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      listing_attribute_values: {
        Row: {
          lav_id: number
          listing_id: number
          attribute_id: number
          value_number: number | null
          value_varchar: string | null
          value_date: string | null
          value_boolean: boolean | null
          option_id: number | null
        }
        Insert: {
          lav_id?: number
          listing_id: number
          attribute_id: number
          value_number?: number | null
          value_varchar?: string | null
          value_date?: string | null
          value_boolean?: boolean | null
          option_id?: number | null
        }
        Update: {
          lav_id?: number
          listing_id?: number
          attribute_id?: number
          value_number?: number | null
          value_varchar?: string | null
          value_date?: string | null
          value_boolean?: boolean | null
          option_id?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updateables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Helper types for attributes
export type AttributeType = Tables<'attributes'>
export type AttributeOptionType = Tables<'attribute_options'>
export type ListingItemType = Tables<'listing_items'>
export type ListingAttributeValueType = Tables<'listing_attribute_values'>

// Filter Types
export interface AttributeFilter {
  code: string
  type: 'NUMBER' | 'VARCHAR' | 'DATE' | 'BOOLEAN' | 'ENUM'
  name: string
  options?: AttributeOptionType[]
  isMultiple: boolean
}

export interface FilterValue {
  attributeCode: string
  value: string | number | boolean | string[] | number[] | [number, number] | [string, string] | null
} 