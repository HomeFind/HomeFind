import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please check your .env.local file.',
    {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? '✓' : '✗',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? '✓' : '✗',
    }
  );
}

// Hardcoded fallback values for development only - remove in production
const fallbackUrl = 'https://treebkeutnwjsbzwyzhe.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZWVia2V1dG53anNiend5emhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMyOTk3MzIsImV4cCI6MjAyODg3NTczMn0.uil8Crs8LEh4Cvo45Mk5P_bkJQyJqVlv-3F6BZ_rLdQ';

export const supabase = createClient<Database>(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey
); 