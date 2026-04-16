import { NextRequest, NextResponse } from "next/server";
import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { writeFile, unlink, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { apiGuard, isGuardError } from "@/lib/api-guard";
import { successResponse, errorResponse } from "@/types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;
const CONFIRM_PHRASE = "PULIHKAN DATA";

type RestoreResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
};

async function runRestore(sqlFilePath: string, isGzip: boolean): Promise<RestoreResult> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL tidak dikonfigurasi");

  return new Promise((resolve, reject) => {
    const psql = spawn("psql", [
      "--quiet",
      "--set=ON_ERROR_STOP=1",
      databaseUrl,
    ]);

    let stdout = "";
    let stderr = "";
    psql.stdout.on("data", (d) => { stdout += d.toString(); });
    psql.stderr.on("data", (d) => { stderr += d.toString(); });
    psql.on("error", reject);
    psql.on("close", (code) => resolve({ stdout, stderr, exitCode: code }));

    if (isGzip) {
      const gunzip = spawn("gunzip", ["-c", sqlFilePath]);
      gunzip.stdout.pipe(psql.stdin);
      gunzip.stderr.on("data", (d) => { stderr += `[gunzip] ${d.toString()}`; });
      gunzip.on("error", reject);
    } else {
      const stream = createReadStream(sqlFilePath);
      stream.pipe(psql.stdin);
      stream.on("error", reject);
    }
  });
}

export async function POST(req: NextRequest) {
  const session = await apiGuard({ minRole: "SUPER_ADMIN" });
  if (isGuardError(session)) return session;

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json(errorResponse("Request tidak valid"), { status: 400 });
  }

  const confirm = formData.get("confirm");
  const file = formData.get("file");

  if (confirm !== CONFIRM_PHRASE) {
    return NextResponse.json(
      errorResponse(`Ketik "${CONFIRM_PHRASE}" untuk konfirmasi`),
      { status: 400 }
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json(errorResponse("File backup tidak ditemukan"), { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json(errorResponse("File kosong"), { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      errorResponse(`Ukuran file melebihi batas (${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB)`),
      { status: 413 }
    );
  }

  const filename = file.name.toLowerCase();
  const isGzip = filename.endsWith(".gz") || file.type === "application/gzip";
  const isSql = filename.endsWith(".sql") || filename.endsWith(".sql.gz");
  if (!isSql) {
    return NextResponse.json(
      errorResponse("Format file harus .sql atau .sql.gz"),
      { status: 400 }
    );
  }

  const tmpDir = await mkdtemp(path.join(tmpdir(), "hris-restore-"));
  const tmpFile = path.join(tmpDir, isGzip ? "backup.sql.gz" : "backup.sql");

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tmpFile, buffer);

    const result = await runRestore(tmpFile, isGzip);

    if (result.exitCode !== 0) {
      return NextResponse.json(
        errorResponse(
          `Restore gagal (exit ${result.exitCode}): ${result.stderr.slice(-500) || "unknown error"}`
        ),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse({
        message: "Restore berhasil. Silakan login ulang untuk memuat data terbaru.",
        bytesProcessed: file.size,
      })
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memproses file";
    return NextResponse.json(errorResponse(message), { status: 500 });
  } finally {
    await unlink(tmpFile).catch(() => undefined);
  }
}
