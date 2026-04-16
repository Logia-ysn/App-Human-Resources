-- CreateTable: org_levels (configurable hierarchy)
CREATE TABLE "org_levels" (
    "id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_levels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "org_levels_rank_key" ON "org_levels"("rank");
CREATE UNIQUE INDEX "org_levels_code_key" ON "org_levels"("code");

-- Seed default org levels (matching old PositionLevel + new upper levels)
INSERT INTO "org_levels" ("id", "rank", "name", "code", "updatedAt") VALUES
  ('ol_komisaris',  0, 'Komisaris',         'KOMISARIS',  NOW()),
  ('ol_dirut',      1, 'Direktur Utama',    'DIRUT',      NOW()),
  ('ol_director',   2, 'Direktur',          'DIRECTOR',   NOW()),
  ('ol_gm',         3, 'General Manager',   'GM',         NOW()),
  ('ol_manager',    4, 'Manager',           'MANAGER',    NOW()),
  ('ol_supervisor', 5, 'Supervisor',        'SUPERVISOR', NOW()),
  ('ol_staff',      6, 'Staff',             'STAFF',      NOW());

-- Add nullable orgLevelId to positions
ALTER TABLE "positions" ADD COLUMN "orgLevelId" TEXT;

-- Migrate existing level enum → orgLevelId
UPDATE "positions" SET "orgLevelId" = 'ol_director'   WHERE "level" = 'DIRECTOR';
UPDATE "positions" SET "orgLevelId" = 'ol_manager'    WHERE "level" = 'MANAGER';
UPDATE "positions" SET "orgLevelId" = 'ol_supervisor' WHERE "level" = 'SUPERVISOR';
UPDATE "positions" SET "orgLevelId" = 'ol_staff'      WHERE "level" = 'STAFF';

-- Fallback: any remaining positions get STAFF
UPDATE "positions" SET "orgLevelId" = 'ol_staff' WHERE "orgLevelId" IS NULL;

-- Drop old level column and enum
ALTER TABLE "positions" DROP COLUMN "level";
DROP TYPE IF EXISTS "PositionLevel";

-- CreateIndex and FK
CREATE INDEX "positions_orgLevelId_idx" ON "positions"("orgLevelId");
ALTER TABLE "positions" ADD CONSTRAINT "positions_orgLevelId_fkey"
  FOREIGN KEY ("orgLevelId") REFERENCES "org_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
