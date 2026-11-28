import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export function createClient() {
  const { url, anonKey } = getSupabasePublicConfig();

  return createBrowserClient<Database>(
    url,
    anonKey,
  );
}
