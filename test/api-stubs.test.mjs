import assert from "node:assert/strict";
import { test } from "node:test";
import { GET as getTechnicianApplications, POST as postTechnicianApplication } from "../src/app/api/technician-applications/route.ts";
import { PATCH as patchTechnicianApplication } from "../src/app/api/technician-applications/[id]/route.ts";
import { PATCH as patchReport } from "../src/app/api/reports/[id]/route.ts";
import { POST as postWarning } from "../src/app/api/warnings/route.ts";

const handlers = [
  ["GET technician applications", getTechnicianApplications],
  ["POST technician application", postTechnicianApplication],
  ["PATCH technician application", patchTechnicianApplication],
  ["PATCH report", patchReport],
  ["POST warning", postWarning],
];

for (const [name, handler] of handlers) {
  test(name, async () => {
    const response = await handler();

    assert.equal(response.status, 501);
    assert.deepEqual(await response.json(), {
      error: "Endpoint belum tersedia.",
      code: "NOT_IMPLEMENTED",
    });
  });
}
