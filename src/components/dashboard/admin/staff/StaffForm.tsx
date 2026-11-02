"use client";

import { useState } from "react";
import Modal from "@/components/dashboard/admin/Modal";
import {
  FormField,
  inputClass,
  buttonGhost,
  buttonPrimary,
} from "@/components/dashboard/admin/FormField";

export type StaffFormValues = {
  username: string;
  email: string;
  role: "Moderator" | "Super Admin";
};

type StaffFormProps = {
  open: boolean;
  initialValue: StaffFormValues;
  onClose: () => void;
  onSave: (values: StaffFormValues) => void;
};

export default function StaffForm(props: StaffFormProps) {
  if (!props.open) return null;

  return <StaffFormContent key={JSON.stringify(props.initialValue)} {...props} />;
}

function StaffFormContent({
  open,
  initialValue,
  onClose,
  onSave,
}: StaffFormProps) {
  const [formState, setFormState] = useState<StaffFormValues>(initialValue);

  const save = () => {
    if (!formState.username.trim() || !formState.email.trim()) return;
    onSave({
      username: formState.username.trim(),
      email: formState.email.trim(),
      role: formState.role,
    });
  };

  return (
    <Modal
      open={open}
      title={initialValue.username ? "Edit moderator" : "Tambah moderator baru"}
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className={buttonGhost} onClick={onClose}>
            Batal
          </button>
          <button type="button" className={buttonPrimary} onClick={save}>
            {initialValue.username ? "Simpan perubahan" : "Tambah moderator"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Username">
          <input
            className={inputClass}
            value={formState.username}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                username: event.target.value,
              }))
            }
            placeholder="Contoh: moderator_rani"
          />
        </FormField>

        <FormField label="Email">
          <input
            className={inputClass}
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            placeholder="nama@aadk.id"
          />
        </FormField>

        <FormField label="Role">
          <select
            className={inputClass}
            value={formState.role}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                role: event.target.value as "Moderator" | "Super Admin",
              }))
            }
          >
            <option value="Moderator">Moderator</option>
            <option value="Super Admin">Super Admin</option>
          </select>
        </FormField>
      </div>
    </Modal>
  );
}
