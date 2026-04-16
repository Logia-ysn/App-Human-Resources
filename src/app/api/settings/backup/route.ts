import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { Readable } from "node:stream";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { errorResponse } from "@/types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export async function GET(_req: NextRequest) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json(errorResponse("DATABASE_URL tidak dikonfigurasi"), { status: 500 });
  }

  const pgDump = spawn(
    "pg_dump",
    [
      "--clean",
      "--if-exists",
      "--no-owner",
      "--no-privileges",
      "--format=plain",
      databaseUrl,
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  const gzip = spawn("gzip", ["-c", "-6"], { stdio: ["pipe", "pipe", "pipe"] });
  pgDump.stdout.pipe(gzip.stdin);

  let dumpError = "";
  pgDump.stderr.on("data", (chunk) => {
    dumpError += chunk.toString();
  });
  pgDump.on("error", (err) => {
    gzip.stdin.destroy(err);
  });

  const webStream = Readable.toWeb(gzip.stdout) as ReadableStream<Uint8Array>;

  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="hris-backup-${timestamp()}.sql.gz"`,
      "Cache-Control": "no-store",
      "X-Backup-Warning": dumpError ? "pg_dump stderr present" : "ok",
    },
  });
}
