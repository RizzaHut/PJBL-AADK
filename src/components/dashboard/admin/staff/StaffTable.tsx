import DataTable from "@/components/dashboard/admin/DataTable";

export type StaffTableRow = {
  id: string;
  username: string;
  email: string;
  role: "Moderator" | "Super Admin";
};

export default function StaffTable({
  rows,
  onView,
  onEdit,
  onDelete,
}: {
  rows: StaffTableRow[];
  onView: (row: StaffTableRow) => void;
  onEdit: (row: StaffTableRow) => void;
  onDelete: (row: StaffTableRow) => void;
}) {
  return (
    <DataTable
      data={rows}
      searchPlaceholder="Cari moderator…"
      searchKeys={["username", "email", "role"]}
      filters={[
        {
          key: "role",
          label: "Role",
          options: [
            { value: "Moderator", label: "Moderator" },
            { value: "Super Admin", label: "Super Admin" },
          ],
        },
      ]}
      columns={[
        { key: "username", label: "Username" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
      ]}
      actions={{
        view: (row) => onView(row),
        edit: (row) => onEdit(row),
        delete: (row) => onDelete(row),
      }}
    />
  );
}
