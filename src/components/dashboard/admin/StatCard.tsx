import {
  BarChart3,
  BookOpen,
  Gamepad2,
  MessageSquare,
  ShieldAlert,
  Users,
  UsersRound,
} from "lucide-react";

type StatCardProps = {
  label: string;
  value: string;
  type: "blue" | "orange" | "green";
};

const icons = {
  "Total pengguna": Users,
  "Total konsol": Gamepad2,
  "Total tutorial": BookOpen,
  "Total post forum": MessageSquare,
  "Laporan menunggu": BarChart3,
  "Pengajuan teknisi": UsersRound,
  "Peringatan aktif": ShieldAlert,
  "Tindakan bulan ini": BarChart3,
};

export default function StatCard({ label, value, type }: StatCardProps) {
  const Icon = icons[label as keyof typeof icons] ?? BarChart3;
  const styles = {
    blue: "bg-[#5979DA] text-white",
    orange: "bg-[#EF542B] text-white",
    green: "bg-[#91BC79] text-[#242424]",
  };

  return (
    <div className={`rounded-xl p-4 ${styles[type]}`}>
      <div className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-white/20">
        <Icon size={16} strokeWidth={1.5} />
      </div>
      <div className="mt-2.5 text-[26px] font-semibold leading-none tracking-tight">
        {value}
      </div>
      <div className="mt-1 text-[12.5px] opacity-80">{label}</div>
    </div>
  );
}
