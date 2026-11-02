"use client";

import { useState } from "react";
import Modal from "@/components/dashboard/admin/Modal";
import {
  FormField,
  inputClass,
  buttonGhost,
  buttonPrimary,
} from "@/components/dashboard/admin/FormField";

export type UserFormValues = {
  username: string;
  email: string;
  role: "Anggota" | "Teknisi";
};

type UserFormProps = {
  open: boolean;
  initialValue: UserFormValues;
  onClose: () => void;
  onSave: (values: UserFormValues) => void;
};

export default function UserForm(props: UserFormProps) {
  if (!props.open) return null;

  return <UserFormContent key={JSON.stringify(props.initialValue)} {...props} />;
}

function UserFormContent({
  open,
  initialValue,
  onClose,
  onSave,
}: UserFormProps) {
  const [formState, setFormState] = useState<UserFormValues>(initialValue);

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
      title={initialValue.username ? "Edit user" : "Tambah user baru"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={buttonGhost} onClick={onClose}>
            Batal
          </button>
          <button type="button" className={buttonPrimary} onClick={save}>
            {initialValue.username ? "Simpan perubahan" : "Tambah user"}
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
          />
        </FormField>

        <FormField label="Email">
          <input
            className={inputClass}
            type="email"
            value={formState.email}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
          />
        </FormField>

        <FormField label="Role">
          <select
            className={inputClass}
            value={formState.role}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                role: event.target.value as "Anggota" | "Teknisi",
              }))
            }
          >
            <option value="Anggota">Anggota</option>
            <option value="Teknisi">Teknisi</option>
          </select>
        </FormField>
      </div>
    </Modal>
  );
}
