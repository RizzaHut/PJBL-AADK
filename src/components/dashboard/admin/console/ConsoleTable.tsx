import DataTable from "@/components/dashboard/admin/DataTable";

export type ConsoleTableRow = {
  id?: string;
  nama: string;
  merek: string;
  tipe: string;
  tahun: number;
  model: number;
};

export default function ConsoleTable({
  rows,
  onView,
  onEdit,
  onDelete,
}: {
  rows: ConsoleTableRow[];
  onView: (row: ConsoleTableRow) => void;
  onEdit: (row: ConsoleTableRow) => void;
  onDelete: (row: ConsoleTableRow) => void;
}) {
  return (
    <DataTable
      data={rows}
      searchPlaceholder="Cari nama konsol, merek, atau tipe…"
      searchKeys={["nama", "merek", "tipe"]}
      filters={[
        {
          key: "merek",
          label: "Merek",
          options: [
            { value: "Nintendo", label: "Nintendo" },
            { value: "PlayStation", label: "PlayStation" },
            { value: "Xbox", label: "Xbox" },
          ],
        },
        {
          key: "tipe",
          label: "Tipe",
          options: [
            { value: "Home Console", label: "Home Console" },
            { value: "Hybrid Console", label: "Hybrid Console" },
            { value: "Handheld Console", label: "Handheld Console" },
          ],
        },
      ]}
      columns={[
        { key: "nama", label: "Konsol" },
        { key: "merek", label: "Merek" },
        { key: "tipe", label: "Tipe" },
        { key: "tahun", label: "Tahun rilis" },
        { key: "model", label: "Jumlah model" },
      ]}
      actions={{
        view: (row) => onView(row),
        edit: (row) => onEdit(row),
        delete: (row) => onDelete(row),
      }}
    />
  );
}
