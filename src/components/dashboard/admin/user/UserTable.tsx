import DataTable from "@/components/dashboard/admin/DataTable";

export type UserTableRow = {
  id: string;
  username: string;
  email: string;
  role: string;
  aktif: string;
  sejak: string;
};

function RoleBadge({ role }: { role: string }) {
  const styles =
    role === "Teknisi"
      ? "bg-[#E4EBE1] text-[#4D7139]"
      : "bg-[#EDF1FE] text-[#1F53A2]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.75 text-xs font-medium ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {role}
    </span>
  );
}

export default function UserTable({
  rows,
  onView,
  onEdit,
  onDelete,
}: {
  rows: UserTableRow[];
  onView: (row: UserTableRow) => void;
  onEdit: (row: UserTableRow) => void;
  onDelete: (row: UserTableRow) => void;
}) {
  return (
    <DataTable
      data={rows}
      searchPlaceholder="Cari username atau email…"
      searchKeys={["username", "email", "role"]}
      filters={[
        {
          key: "role",
          label: "Role",
          options: [
            { value: "Anggota", label: "Anggota" },
            { value: "Teknisi", label: "Teknisi" },
          ],
        },
      ]}
      columns={[
        {
          key: "username",
          label: "Pengguna",
          render: (_, row) => (
            <div>
              <div className="font-medium text-[#242424]">{row.username}</div>
              <div className="mt-0.5 text-[12.5px] text-[#606060]">
                {row.email}
              </div>
            </div>
          ),
        },
        {
          key: "role",
          label: "Role",
          render: (value) => <RoleBadge role={String(value)} />,
        },
        { key: "aktif", label: "Terakhir aktif" },
        { key: "sejak", label: "Anggota sejak" },
      ]}
      actions={{
        view: (row) => onView(row),
        edit: (row) => onEdit(row),
        delete: (row) => onDelete(row),
      }}
    />
  );
}
