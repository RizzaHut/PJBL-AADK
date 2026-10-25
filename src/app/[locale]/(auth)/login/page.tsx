import { Outfit } from "next/font/google";
import { LoginHeroPanel } from "@/components/login/LoginHeroPanel";
import { LoginFormPanel } from "@/components/login/LoginFormPanel";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default function LoginPage() {
  return (
    <div
      className={`${outfit.className} flex min-h-screen w-full flex-col md:flex-row`}
    >
      <LoginHeroPanel />
      <LoginFormPanel />
    </div>
  );
}
