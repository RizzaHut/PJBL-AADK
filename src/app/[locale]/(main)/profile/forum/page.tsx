"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/dashboard/admin/Modal";
import {
  buttonGhost,
  buttonPrimary,
  FormField,
  inputClass,
} from "@/components/dashboard/admin/FormField";
import DataTable, { type Column } from "@/components/dashboard/admin/DataTable";
import { ProfileLayout } from "@/components/dashboard/profile/ProfileShell";
import { createClient } from "@/lib/supabase/client";

type ForumRow = {
  id: string;
  judul: string;
  topik: string;
  suka: number;
  komentar: number;
  pembaca: number;
};

export default function ProfileForumPage() {
  const [rows, setRows] = useState<ForumRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForum, setSelectedForum] = useState<ForumRow | null>(null);
  const [editingForum, setEditingForum] = useState<ForumRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ForumRow | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  useEffect(() => {
    const loadForumPosts = async () => {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRows([]);
        setLoading(false);
        return;
      }

      const { data: posts } = await supabase
        .from("postingan_forum")
        .select("id, judul, topik")
        .eq("penulis_id", user.id)
        .order("dibuat_pada", { ascending: false });

      const enriched = await Promise.all(
        (posts ?? []).map(async (post) => {
          const [likesRes, commentsRes, readsRes] = await Promise.all([
            supabase
              .from("suka_postingan")
              .select("pengguna_id", { count: "exact", head: true })
              .eq("postingan_id", post.id),
            supabase
              .from("komentar_forum")
              .select("id", { count: "exact", head: true })
              .eq("postingan_id", post.id),
            supabase
              .from("baca_postingan")
              .select("pengguna_id", { count: "exact", head: true })
              .eq("postingan_id", post.id),
          ]);

          return {
            id: post.id,
            judul: post.judul,
            topik: post.topik,
            suka: likesRes.count ?? 0,
            komentar: commentsRes.count ?? 0,
            pembaca: readsRes.count ?? 0,
          };
        }),
      );

      setRows(enriched);
      setLoading(false);
    };

    void loadForumPosts();
  }, []);

  const openEditForum = (row: ForumRow) => {
    setEditingForum(row);
    setDraftTitle(row.judul);
  };

  const saveForumTitle = async () => {
    if (!editingForum || !draftTitle.trim()) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("postingan_forum")
      .update({ judul: draftTitle.trim() })
      .eq("id", editingForum.id)
      .eq("penulis_id", user.id);

    if (!error) {
      setRows((current) =>
        current.map((item) =>
          item.id === editingForum.id
            ? { ...item, judul: draftTitle.trim() }
            : item,
        ),
      );
    }

    setEditingForum(null);
    setDraftTitle("");
  };

  const confirmDeleteForum = async () => {
    if (!deleteTarget) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("postingan_forum")
      .delete()
      .eq("id", deleteTarget.id)
      .eq("penulis_id", user.id);

    setRows((current) => current.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const columns: Column<ForumRow>[] = [
    { key: "judul", label: "Judul post" },
    { key: "topik", label: "Topik" },
    { key: "suka", label: "Suka" },
    { key: "komentar", label: "Komentar" },
    { key: "pembaca", label: "Pembaca" },
  ];

  return (
    <ProfileLayout>
      <section className="space-y-5">
        <div>
          <h1 className="text-[21px] font-semibold tracking-tight">
            Post forum
          </h1>
          <p className="mt-0.75 text-[13px] text-[#606060]">
            Post forum yang kamu buat dan aktivitasnya di komunitas.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-black bg-white p-4 text-sm text-[#606060]">
            Memuat data post forum...
          </div>
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Cari judul post..."
            searchKeys={["judul", "topik"]}
            filters={[
              {
                key: "topik",
                label: "topik",
                options: [
                  {
                    value: "Hardware & Technical",
                    label: "Hardware & Technical",
                  },
                  { value: "Software & System", label: "Software & System" },
                  { value: "Storage & Memory", label: "Storage & Memory" },
                  {
                    value: "Service & Spare Part",
                    label: "Service & Spare Part",
                  },
                  { value: "General", label: "General" },
                ],
              },
            ]}
            pageSize={5}
            actions={{
              view: (row) => setSelectedForum(row),
              edit: (row) => openEditForum(row),
              delete: (row) => setDeleteTarget(row),
            }}
          />
        )}
      </section>

      <Modal
        open={Boolean(selectedForum)}
        title="Detail post forum"
        wide
        onClose={() => setSelectedForum(null)}
        footer={
          <button
            type="button"
            className={buttonPrimary}
            onClick={() => {
              if (selectedForum) openEditForum(selectedForum);
              setSelectedForum(null);
            }}
          >
            Edit post
          </button>
        }
      >
        {selectedForum && (
          <div className="space-y-4 text-sm text-[#1f2937]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Judul
              </div>
              <div className="mt-1 text-lg font-semibold">
                {selectedForum.judul}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Topik
                </div>
                <div className="mt-1">{selectedForum.topik}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Suka
                </div>
                <div className="mt-1">{selectedForum.suka}</div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Komentar
                </div>
                <div className="mt-1">{selectedForum.komentar}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Pembaca
                </div>
                <div className="mt-1">{selectedForum.pembaca}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(editingForum)}
        title="Edit post forum"
        onClose={() => setEditingForum(null)}
        footer={
          <>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => setEditingForum(null)}
            >
              Batal
            </button>
            <button
              type="button"
              className={buttonPrimary}
              onClick={saveForumTitle}
            >
              Simpan
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Judul post">
            <input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Hapus post forum"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => setDeleteTarget(null)}
            >
              Batal
            </button>
            <button
              type="button"
              className={buttonPrimary}
              onClick={confirmDeleteForum}
            >
              Hapus
            </button>
          </>
        }
      >
        {deleteTarget && (
          <p className="text-sm text-slate-700">
            Apakah Anda yakin ingin menghapus post{" "}
            <strong>{deleteTarget.judul}</strong>?
          </p>
        )}
      </Modal>
    </ProfileLayout>
  );
}
