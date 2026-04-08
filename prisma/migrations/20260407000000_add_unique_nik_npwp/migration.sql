-- Add unique constraints to employees.nik and employees.npwp
-- Rationale: NIK must be unique by Indonesian law; NPWP unique per entity.
-- Duplicate check was run prior to migration — 0 duplicates found.

CREATE UNIQUE INDEX "employees_nik_key" ON "employees"("nik");
CREATE UNIQUE INDEX "employees_npwp_key" ON "employees"("npwp");
