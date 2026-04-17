import { prisma } from "@/lib/db";
import { DEFAULT_APP_CONFIG, type AppConfigData } from "@/hooks/use-settings";
import { haversineDistance } from "@/lib/utils/geo";

export async function loadAppConfig(): Promise<AppConfigData> {
  const row = await prisma.appConfig.findFirst({ where: { id: "app-config" } });
  const stored = (row?.data as Partial<AppConfigData>) ?? {};
  return { ...DEFAULT_APP_CONFIG, ...stored };
}

type GpsCheck = { ok: true } | { ok: false; message: string };

export function validateGpsRadius(
  config: AppConfigData,
  latitude: number | undefined,
  longitude: number | undefined,
): GpsCheck {
  if (config.attendanceMethod !== "GPS") return { ok: true };

  if (latitude == null || longitude == null) {
    return { ok: false, message: "Lokasi GPS diperlukan untuk absensi. Aktifkan GPS di perangkat Anda." };
  }

  if (config.officeLat == null || config.officeLng == null) {
    return { ok: false, message: "Koordinat kantor belum dikonfigurasi. Hubungi admin." };
  }

  const distance = haversineDistance(latitude, longitude, config.officeLat, config.officeLng);
  if (distance > config.gpsRadiusMeters) {
    return {
      ok: false,
      message: `Anda berada ${Math.round(distance)} meter dari kantor. Maksimal radius: ${config.gpsRadiusMeters} meter.`,
    };
  }

  return { ok: true };
}
