import Image from "next/image";
import FeatureIconCard from "./FeatureIconCard";

const benefits = [
  {
    icon: "Person Question icon.svg",
    title: "Bantu pengguna",
    description: "Atasi masalah konsol mereka",
  },
  {
    icon: "Book icon.svg",
    title: "Publikasi tutorial",
    description: "Modding dan perbaikan",
  },
  {
    icon: "Checkmark icon.svg",
    title: "Tanda pengenal khusus",
    description: "Tunjukkan keahlianmu",
  },
] as const;

function BenefitIcon({ name }: { name: string }) {
  return (
    <Image
      src={`/assets/Icons/${name}`}
      alt=""
      width={64}
      height={64}
      className="h-full w-full object-contain"
    />
  );
}

export default function TechnicianBenefits() {
  return (
    <div
      className="grid grid-cols-3 gap-5 max-[600px]:grid-cols-1"
      aria-label="Manfaat menjadi teknisi"
    >
      {benefits.map((benefit) => (
        <FeatureIconCard
          key={benefit.title}
          icon={<BenefitIcon name={benefit.icon} />}
          title={benefit.title}
          description={benefit.description}
        />
      ))}
    </div>
  );
}
