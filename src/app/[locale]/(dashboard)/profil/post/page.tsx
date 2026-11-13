import type { Metadata } from "next";
import { localizedMetadata } from "@/i18n/metadata";
import { setRequestLocale } from "next-intl/server";
import { Drawer } from "@/components/dashboard/ui/Drawer";
import { Icon } from "@/components/dashboard/ui/Icon";
import { PageHeader } from "@/components/dashboard/ui/PageHeader";
import { PostDetail } from "@/components/dashboard/profil/PostDetail";
import { BASE_POST, PostDibuatTable, SubTab } from "@/components/dashboard/profil/PostTables";
import { Link } from "@/i18n/navigation";
import { daftarPostDibuat, detailPost, jumlahPost, KONFIG_POST_DIBUAT } from "@/lib/queries/profil";
import { bacaParam, buatHref, type SearchParams } from "@/lib/table-params";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return localizedMetadata(locale, "Post forum · Profil", "Forum posts · Profile");
}

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const param = bacaParam(await searchParams, KONFIG_POST_DIBUAT);
  const [list, detail, jumlah] = await Promise.all([
    daftarPostDibuat(param),
    param.detail ? detailPost(param.detail) : Promise.resolve(null),
    jumlahPost(),
  ]);
  const tutupHref = buatHref(BASE_POST, param, { detail: null });

  return (
    <>
      <PageHeader
        judul="Post forum"
        sub="Post yang kamu buat dan post yang kamu sukai."
        aksi={
          <Link className="btn btn-primary" href="/profil/post/baru">
            <Icon nama="plus" />
            Buat post
          </Link>
        }
      />
      <SubTab aktif="dibuat" jumlah={jumlah} />
      <PostDibuatTable list={list} param={param} />
      {detail ? (
        <Drawer
          judul="Detail post"
          tutupHref={tutupHref}
          foot={
            <Link className="btn btn-ghost" href={`/profil/post/${detail.id}/edit`}>
              <Icon nama="edit" />
              Edit post
            </Link>
          }
        >
          <PostDetail p={detail} />
        </Drawer>
      ) : null}
    </>
  );
}
