import { supabase } from './supabase';
import { AttributeFilter, AttributeType, AttributeOptionType } from './database.types';

/**
 * Fetches all attribute definitions
 */
export async function getAttributes(): Promise<AttributeType[]> {
  const { data, error } = await supabase
    .from('attributes')
    .select('*')
    .order('attribute_name');

  if (error) {
    console.error('Error fetching attributes:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetches options for a specific attribute
 */
export async function getAttributeOptions(attributeId: number): Promise<AttributeOptionType[]> {
  const { data, error } = await supabase
    .from('attribute_options')
    .select('*')
    .eq('attribute_id', attributeId);

  if (error) {
    console.error(`Error fetching options for attribute ${attributeId}:`, error);
    return [];
  }

  return data || [];
}

/**
 * Fetches all attribute definitions with their options
 */
export async function getAttributesWithOptions(): Promise<AttributeFilter[]> {
  const attributes = await getAttributes();
  
  const attributesWithOptions = await Promise.all(
    attributes.map(async (attribute) => {
      let options: AttributeOptionType[] | undefined = undefined;
      
      if (attribute.is_enumeration) {
        options = await getAttributeOptions(attribute.id);
      }
      
      return {
        code: attribute.attribute_code,
        type: attribute.data_type,
        name: attribute.attribute_name,
        options,
        isMultiple: attribute.is_multiple
      };
    })
  );
  
  return attributesWithOptions;
} 