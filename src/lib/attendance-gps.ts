import { prisma } from "@/lib/db";
import { DEFAULT_APP_CONFIG, type AppConfigData } from "@/hooks/use-settings";
import { haversineDistance } from "@/lib/utils/geo";

export async function loadAppConfig(): Promise<AppConfigData> {
  const row = await prisma.appConfig.findFirst({ where: { id: "app-config" } });
  const stored = (row?.data as Partial<AppConfigData>) ?? {};
  return { ...DEFAULT_APP_CONFIG, ...stored };
}

type GpsCheck = { ok: true } | { ok: false; message: string };

export async function validateGpsRadius(
  config: AppConfigData,
  latitude: number | undefined,
  longitude: number | undefined,
): Promise<GpsCheck> {
  if (config.attendanceMethod !== "GPS") return { ok: true };

  if (latitude == null || longitude == null) {
    return { ok: false, message: "Lokasi GPS diperlukan untuk absensi. Aktifkan GPS di perangkat Anda." };
  }

  const locations = await prisma.officeLocation.findMany({
    where: { isActive: true },
    select: { name: true, latitude: true, longitude: true, radius: true },
  });

  if (locations.length === 0) {
    return { ok: false, message: "Belum ada lokasi kantor yang dikonfigurasi. Hubungi admin." };
  }

  let nearest = Infinity;
  let nearestName = "";
  for (const loc of locations) {
    const dist = haversineDistance(
      latitude,
      longitude,
      Number(loc.latitude),
      Number(loc.longitude),
    );
    const effectiveRadius = loc.radius ?? config.gpsRadiusMeters;
    if (dist <= effectiveRadius) return { ok: true };
    if (dist < nearest) {
      nearest = dist;
      nearestName = loc.name;
    }
  }

  return {
    ok: false,
    message: `Anda berada ${Math.round(nearest)}m dari lokasi terdekat (${nearestName}). Absensi hanya dapat dilakukan di area kantor.`,
  };
}
