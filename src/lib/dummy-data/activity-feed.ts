export type ActivityItem = {
  id: string;
  type: "leave" | "employee" | "payroll" | "attendance" | "recruitment" | "training";
  action: string;
  description: string;
  actor: string;
  timestamp: string;
};

export const activityFeed: ActivityItem[] = [
  { id: "act-1", type: "leave", action: "Pengajuan Cuti", description: "Budi Santoso mengajukan cuti tahunan 25-27 Mar 2026", actor: "Budi Santoso", timestamp: "2026-03-23T08:30:00" },
  { id: "act-2", type: "payroll", action: "Payroll Dihitung", description: "Payroll Maret 2026 selesai dihitung untuk 14 karyawan", actor: "Sari Dewi", timestamp: "2026-03-22T16:00:00" },
  { id: "act-3", type: "employee", action: "Karyawan Baru", description: "Dewi Lestari bergabung sebagai Software Developer di dept IT", actor: "System", timestamp: "2026-03-21T09:00:00" },
  { id: "act-4", type: "attendance", action: "Lembur Disetujui", description: "Lembur Andi Prasetyo (3 jam) telah disetujui", actor: "Sari Dewi", timestamp: "2026-03-20T17:30:00" },
  { id: "act-5", type: "recruitment", action: "Pelamar Baru", description: "5 pelamar baru untuk posisi Frontend Developer", actor: "System", timestamp: "2026-03-20T10:00:00" },
  { id: "act-6", type: "training", action: "Training Dimulai", description: "Leadership Workshop dimulai dengan 8 peserta", actor: "System", timestamp: "2026-03-19T09:00:00" },
  { id: "act-7", type: "leave", action: "Cuti Disetujui", description: "Cuti Rina Wulandari (2 hari) telah disetujui", actor: "Budi Santoso", timestamp: "2026-03-19T14:00:00" },
  { id: "act-8", type: "employee", action: "Kontrak Diperpanjang", description: "Kontrak Agus Setiawan diperpanjang hingga Des 2026", actor: "Sari Dewi", timestamp: "2026-03-18T11:00:00" },
];
