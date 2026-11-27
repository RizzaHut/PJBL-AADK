const belumTersedia = () =>
  Response.json(
    { error: "Endpoint belum tersedia.", code: "NOT_IMPLEMENTED" },
    { status: 501 },
  );

export function POST() {
  return belumTersedia();
}
