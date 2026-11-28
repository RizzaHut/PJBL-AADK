import { Outfit } from "next/font/google";
import { LoginHeroPanel } from "@/components/login/LoginHeroPanel";
import { LoginFormPanel } from "@/components/login/LoginFormPanel";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  const tujuanSetelahMasuk =
    next === "/profil/jadi-teknisi" ? next : undefined;

  return (
    <div
      className={`${outfit.className} flex min-h-screen w-full flex-col md:flex-row`}
    >
      <LoginHeroPanel />
      <LoginFormPanel tujuanSetelahMasuk={tujuanSetelahMasuk} />
    </div>
  );
}
