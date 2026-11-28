export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  try {
    const parsedUrl = new URL(url);
    const isLocalhost =
      parsedUrl.hostname === "localhost" ||
      parsedUrl.hostname === "127.0.0.1" ||
      parsedUrl.hostname === "[::1]";
    if (
      parsedUrl.protocol !== "https:" &&
      !(parsedUrl.protocol === "http:" && isLocalhost)
    ) {
      throw new Error();
    }
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL bukan URL Supabase yang valid.");
  }

  return { url, anonKey };
}
