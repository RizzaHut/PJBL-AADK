import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicConfig();

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll dipanggil dari Server Component — boleh diabaikan
            // kalau ada middleware yang refresh session user.
          }
        },
      },
    }
  );
}
