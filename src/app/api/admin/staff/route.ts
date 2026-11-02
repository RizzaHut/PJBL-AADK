import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const STAFF_ROLES = new Set(["moderator", "super_admin"]);

type CreateStaffBody = {
  username?: unknown;
  email?: unknown;
  peran?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: currentStaff, error: staffError } = await supabase
      .from("staf")
      .select("peran")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (staffError || currentStaff?.peran !== "super_admin") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = (await request.json()) as CreateStaffBody;
    const username =
      typeof body.username === "string" ? body.username.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const peran = typeof body.peran === "string" ? body.peran : "";

    if (!username || !email || !STAFF_ROLES.has(peran)) {
      return NextResponse.json(
        { error: "Username, email, dan peran wajib diisi dengan benar." },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    const { data: invited, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(email, {
        data: {
          tipe_akun: "staf",
          username,
          peran,
        },
      });

    if (inviteError || !invited.user) {
      return NextResponse.json(
        { error: inviteError?.message ?? "Gagal membuat akun Auth staf." },
        { status: 400 },
      );
    }

    const { data, error: staffRowError } = await admin
      .from("staf")
      .select("id, username, email, peran")
      .eq("id", invited.user.id)
      .single();

    if (staffRowError) {
      await admin.auth.admin.deleteUser(invited.user.id);
      return NextResponse.json(
        { error: staffRowError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Gagal menambahkan staf.",
      },
      { status: 500 },
    );
  }
}
