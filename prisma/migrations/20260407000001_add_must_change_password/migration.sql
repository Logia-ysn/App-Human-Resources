-- Add mustChangePassword flag to force default-password users to rotate on first login
ALTER TABLE "users" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
-- Flag existing seed accounts (known default passwords)
UPDATE "users"
SET "mustChangePassword" = true
WHERE "email" IN (
  'admin@company.co.id',
  'hr@company.co.id',
  'manager@company.co.id',
  'karyawan@company.co.id'
);
