import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "@/i18n/config";
import { updateSession } from "@/lib/supabase/middleware";
import { alihanDitolak, canAccessRoute } from "@/lib/auth/role-guard";
import type { Peran } from "@/types/domain";

/**
 * Pengganti middleware.ts (Next 16 memakai nama proxy.ts).
 * Lapisan 1 dari 3: pengalihan cepat. Penegakan sebenarnya ada di requireRole()
 * dan RLS database.
 */

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

const RUTE_AUTH = ["/login", "/register", "/register/teknisi"];
const RUTE_KONTEN_PUBLIK = ["/", "/home", "/consoles", "/forum", "/about"];

function adalahRuteKontenPublik(pathname: string) {
  return RUTE_KONTEN_PUBLIK.some(
    (rute) =>
      pathname === rute ||
      (rute !== "/" && pathname.startsWith(`${rute}/`)),
  );
}

export async function proxy(request: NextRequest) {
  const punyaLocale = locales.some(
    (l) =>
      request.nextUrl.pathname === `/${l}` ||
      request.nextUrl.pathname.startsWith(`/${l}/`),
  );
  if (!punyaLocale) return handleI18nRouting(request);

  const locale = request.nextUrl.pathname.split("/")[1] ?? defaultLocale;
  const pathname =
    request.nextUrl.pathname.replace(/^\/(?:id|en)(?=\/|$)/, "") || "/";

  const { response, user, supabase } = await updateSession(request);
  response.cookies.delete("aadk_demo_peran");
  response.cookies.delete("aadk_demo_kondisi");
  if (RUTE_AUTH.includes(pathname)) return response;
  const peran = user ? await cariPeran(supabase, user.id) : null;

  if (!peran) {
    if (adalahRuteKontenPublik(pathname)) return response;
    const tujuan = request.nextUrl.clone();
    tujuan.pathname = `/${locale}/login`;
    tujuan.search = "";
    return NextResponse.redirect(tujuan);
  }

  if (!canAccessRoute(pathname, peran)) {
    return NextResponse.redirect(
      new URL(`/${locale}${alihanDitolak(pathname, peran)}`, request.url),
    );
  }

  return response;
}

/** Peran dari `staf` (moderator/super_admin), kalau tidak ada dari `pengguna`. */
async function cariPeran(
  supabase: Awaited<ReturnType<typeof updateSession>>["supabase"],
  userId: string,
): Promise<Peran | null> {
  const [
    { data: staf, error: stafError },
    { data: pengguna, error: penggunaError },
  ] = await Promise.all([
    supabase.from("staf").select("peran").eq("id", userId).maybeSingle(),
    supabase.from("pengguna").select("peran").eq("id", userId).maybeSingle(),
  ]);
  if (stafError) throw stafError;
  if (staf?.peran === "moderator" || staf?.peran === "super_admin") return staf.peran;
  if (penggunaError) throw penggunaError;
  return pengguna?.peran === "teknisi" || pengguna?.peran === "anggota"
    ? pengguna.peran
    : null;
}

export const config = {
  // Perbaikan: "\\." (di string JS biasa "\." menjadi "." sehingga matcher lama hanya cocok "/").
  matcher: ["/((?!api|auth|_next|favicon.ico|.*\\..*).*)"],
};
