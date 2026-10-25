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

type CommentRow = {
  id: string;
  author: string;
  isi: string;
  terkait: string;
  tanggal: string;
  createdAt: string;
  jenis: "Tutorial" | "Forum";
  sourceTable: "komentar_tutorial" | "komentar_forum";
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function ProfileKomentarPage() {
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComment, setSelectedComment] = useState<CommentRow | null>(
    null,
  );
  const [editingComment, setEditingComment] = useState<CommentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommentRow | null>(null);
  const [draftComment, setDraftComment] = useState("");

  useEffect(() => {
    const loadComments = async () => {
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

      const [tutorialComments, forumComments] = await Promise.all([
        supabase
          .from("komentar_tutorial")
          .select("id, isi, dibuat_pada, tutorial_id")
          .eq("penulis_id", user.id),
        supabase
          .from("komentar_forum")
          .select("id, isi, dibuat_pada, postingan_id")
          .eq("penulis_id", user.id),
      ]);

      const tutorialIds = (tutorialComments.data ?? []).map(
        (row) => row.tutorial_id,
      );
      const forumIds = (forumComments.data ?? []).map(
        (row) => row.postingan_id,
      );

      const [tutorialTitles, forumTitles] = await Promise.all([
        tutorialIds.length
          ? supabase.from("tutorial").select("id, judul").in("id", tutorialIds)
          : Promise.resolve({
              data: [] as Array<{ id: string; judul: string }>,
            }),
        forumIds.length
          ? supabase
              .from("postingan_forum")
              .select("id, judul")
              .in("id", forumIds)
          : Promise.resolve({
              data: [] as Array<{ id: string; judul: string }>,
            }),
      ]);

      const tutorialMap = new Map(
        (tutorialTitles.data ?? []).map((row) => [row.id, row.judul]),
      );
      const forumMap = new Map(
        (forumTitles.data ?? []).map((row) => [row.id, row.judul]),
      );

      const merged: CommentRow[] = [
        ...(tutorialComments.data ?? []).map((row) => ({
          id: row.id,
          author: user.email?.split("@")[0] ?? "anggota",
          isi: row.isi,
          terkait: tutorialMap.get(row.tutorial_id) ?? "Tutorial terkait",
          tanggal: formatDate(row.dibuat_pada),
          createdAt: row.dibuat_pada ?? new Date(0).toISOString(),
          jenis: "Tutorial" as const,
          sourceTable: "komentar_tutorial" as const,
        })),
        ...(forumComments.data ?? []).map((row) => ({
          id: row.id,
          author: user.email?.split("@")[0] ?? "anggota",
          isi: row.isi,
          terkait: forumMap.get(row.postingan_id) ?? "Forum terkait",
          tanggal: formatDate(row.dibuat_pada),
          createdAt: row.dibuat_pada ?? new Date(0).toISOString(),
          jenis: "Forum" as const,
          sourceTable: "komentar_forum" as const,
        })),
      ];

      setRows(
        merged.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
      setLoading(false);
    };

    void loadComments();
  }, []);

  const openEditComment = (row: CommentRow) => {
    setEditingComment(row);
    setDraftComment(row.isi);
  };

  const saveComment = async () => {
    if (!editingComment || !draftComment.trim()) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from(editingComment.sourceTable)
      .update({ isi: draftComment.trim() })
      .eq("id", editingComment.id)
      .eq("penulis_id", user.id);

    if (!error) {
      setRows((current) =>
        current.map((item) =>
          item.id === editingComment.id
            ? { ...item, isi: draftComment.trim() }
            : item,
        ),
      );
    }

    setEditingComment(null);
    setDraftComment("");
  };

  const confirmDeleteComment = async () => {
    if (!deleteTarget) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from(deleteTarget.sourceTable)
      .delete()
      .eq("id", deleteTarget.id)
      .eq("penulis_id", user.id);

    setRows((current) => current.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const columns: Column<CommentRow>[] = [
    {
      key: "author",
      label: "Author",
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDF1FE] text-[10px] font-bold text-[#1f2937]">
            {String(value ?? "A")
              .slice(0, 1)
              .toUpperCase()}
          </div>
          <span>{String(value ?? "-")}</span>
        </div>
      ),
    },
    { key: "isi", label: "Isi" },
    {
      key: "terkait",
      label: "Terkait",
      render: (value) => (
        <span className="text-[#006FCD]">{String(value ?? "-")}</span>
      ),
    },
    { key: "tanggal", label: "Tanggal" },
  ];

  return (
    <ProfileLayout>
      <section className="space-y-5">
        <div>
          <h1 className="text-[21px] font-semibold tracking-tight">Komentar</h1>
          <p className="mt-0.75 text-[13px] text-[#606060]">
            Riwayat komentar tutorial dan komentar forum yang kamu tulis.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-black bg-white p-4 text-sm text-[#606060]">
            Memuat data komentar...
          </div>
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            searchPlaceholder="Cari isi komentar..."
            searchKeys={["author", "isi", "terkait", "jenis"]}
            filters={[
              {
                key: "jenis",
                label: "jenis",
                options: [
                  { value: "Tutorial", label: "Tutorial" },
                  { value: "Forum", label: "Forum" },
                ],
              },
            ]}
            pageSize={5}
            actions={{
              view: (row) => setSelectedComment(row),
              edit: (row) => openEditComment(row),
              delete: (row) => setDeleteTarget(row),
            }}
          />
        )}
      </section>

      <Modal
        open={Boolean(selectedComment)}
        title="Detail komentar"
        wide
        onClose={() => setSelectedComment(null)}
        footer={
          <button
            type="button"
            className={buttonPrimary}
            onClick={() => {
              if (selectedComment) openEditComment(selectedComment);
              setSelectedComment(null);
            }}
          >
            Edit komentar
          </button>
        }
      >
        {selectedComment && (
          <div className="space-y-4 text-sm text-[#1f2937]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Author
              </div>
              <div className="mt-1 text-lg font-semibold">
                {selectedComment.author}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Jenis
                </div>
                <div className="mt-1">{selectedComment.jenis}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Tanggal
                </div>
                <div className="mt-1">{selectedComment.tanggal}</div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Terkait
              </div>
              <div className="mt-1 text-[#006FCD]">
                {selectedComment.terkait}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Isi komentar
              </div>
              <div className="mt-1 whitespace-pre-wrap">
                {selectedComment.isi}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(editingComment)}
        title="Edit komentar"
        onClose={() => setEditingComment(null)}
        footer={
          <>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => setEditingComment(null)}
            >
              Batal
            </button>
            <button
              type="button"
              className={buttonPrimary}
              onClick={saveComment}
            >
              Simpan
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Isi komentar">
            <textarea
              value={draftComment}
              onChange={(event) => setDraftComment(event.target.value)}
              className={`${inputClass} min-h-30 resize-y`}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Hapus komentar"
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
              onClick={confirmDeleteComment}
            >
              Hapus
            </button>
          </>
        }
      >
        {deleteTarget && (
          <p className="text-sm text-slate-700">
            Apakah Anda yakin ingin menghapus komentar ini?
          </p>
        )}
      </Modal>
    </ProfileLayout>
  );
}
