import { Building2, CheckCircle } from "lucide-react";

const features = [
  "Data Karyawan & Organisasi",
  "Absensi & Manajemen Cuti",
  "Penggajian & Pajak (PPh 21, BPJS)",
  "Rekrutmen & Onboarding",
  "Penilaian Kinerja & Training",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
        <div className="absolute inset-0 opacity-10 bg-[url(&quot;data:image/svg+xml,%3Csvg%20width%3D%2760%27%20height%3D%2760%27%20viewBox%3D%270%200%2060%2060%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%23ffffff%27%20fill-opacity%3D%270.4%27%3E%3Cpath%20d%3D%27M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%27%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E&quot;)]" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-8">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">HRIS</h1>
          <p className="text-xl text-white/80 mb-2">
            Human Resources Information System
          </p>
          <p className="text-sm text-white/60 max-w-md">
            Kelola karyawan, absensi, penggajian, dan seluruh proses HR dalam
            satu platform terintegrasi.
          </p>
          {/* Feature bullets */}
          <div className="mt-10 space-y-3">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3 text-white/70">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-300" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-8">
        {children}
      </div>
    </div>
  );
}
