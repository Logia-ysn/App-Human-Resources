import Link from "next/link";
import { ShieldCheck, Users, Clock3, Wallet } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Users, text: "Manajemen data karyawan end-to-end" },
  { icon: Clock3, text: "Absensi, cuti, dan jam kerja otomatis" },
  { icon: Wallet, text: "Penggajian, BPJS, dan PPh 21 terintegrasi" },
  { icon: ShieldCheck, text: "Audit trail dan kontrol akses berbasis peran" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const year = new Date().getFullYear();

  return (
    <div className="relative grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-20 h-[26rem] w-[26rem] rounded-full bg-primary-foreground/5 blur-3xl"
        />

        <header className="relative z-10 flex items-center gap-2 text-sm font-semibold tracking-wide">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 backdrop-blur-sm">
            <span className="font-bold">H</span>
          </div>
          <span className="uppercase">HRIS</span>
        </header>

        <div className="relative z-10 max-w-lg space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/70">
              Human Resources Platform
            </p>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
              Operasional SDM yang rapi, terukur, dan auditable.
            </h1>
            <p className="max-w-md text-base text-primary-foreground/75">
              Satu sistem untuk mengelola karyawan, kehadiran, penggajian, dan
              seluruh siklus kerja perusahaan Anda.
            </p>
          </div>

          <ul className="space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-3 text-sm text-primary-foreground/85"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-foreground/10">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <footer className="relative z-10 text-xs text-primary-foreground/60">
          © {year} HRIS Platform. Semua data terenkripsi dan tunduk kebijakan
          privasi perusahaan.
        </footer>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen flex-col bg-background">
        <div className="flex items-center justify-between px-6 py-6 lg:hidden">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-xs font-bold">H</span>
            </div>
            HRIS
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-8 md:px-10">
          {children}
        </div>

        <div className="px-6 pb-6 text-center text-xs text-muted-foreground lg:hidden">
          © {year} HRIS Platform
        </div>

        <div className="hidden px-12 pb-8 text-xs text-muted-foreground lg:flex lg:justify-between">
          <span>Perlu bantuan? Hubungi administrator.</span>
          <Link
            href="/login"
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Kembali ke login
          </Link>
        </div>
      </main>
    </div>
  );
}
