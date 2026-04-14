/*
  Warnings:

  - You are about to drop the column `approvedBy` on the `employee_advances` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `expense_claims` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `lifecycle_events` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "attendances_date_idx";

-- AlterTable
ALTER TABLE "employee_advances" DROP COLUMN "approvedBy",
ADD COLUMN     "approvedById" TEXT;

-- AlterTable
ALTER TABLE "expense_claims" DROP COLUMN "approvedBy",
ADD COLUMN     "approvedById" TEXT;

-- AlterTable
ALTER TABLE "lifecycle_events" DROP COLUMN "approvedBy",
ADD COLUMN     "approvedById" TEXT;

-- CreateIndex
CREATE INDEX "attendances_employeeId_status_idx" ON "attendances"("employeeId", "status");

-- CreateIndex
CREATE INDEX "attendances_date_status_idx" ON "attendances"("date", "status");

-- CreateIndex
CREATE INDEX "departments_parentId_idx" ON "departments"("parentId");

-- CreateIndex
CREATE INDEX "departments_headEmployeeId_idx" ON "departments"("headEmployeeId");

-- CreateIndex
CREATE INDEX "employee_advances_approvedById_idx" ON "employee_advances"("approvedById");

-- CreateIndex
CREATE INDEX "employee_documents_uploadedById_idx" ON "employee_documents"("uploadedById");

-- CreateIndex
CREATE INDEX "employee_onboarding_tasks_taskId_idx" ON "employee_onboarding_tasks"("taskId");

-- CreateIndex
CREATE INDEX "employee_salaries_componentId_idx" ON "employee_salaries"("componentId");

-- CreateIndex
CREATE INDEX "employee_schedules_scheduleId_idx" ON "employee_schedules"("scheduleId");

-- CreateIndex
CREATE INDEX "expense_claims_approvedById_idx" ON "expense_claims"("approvedById");

-- CreateIndex
CREATE INDEX "interview_schedules_interviewerId_idx" ON "interview_schedules"("interviewerId");

-- CreateIndex
CREATE INDEX "leave_approvals_leaveRequestId_idx" ON "leave_approvals"("leaveRequestId");

-- CreateIndex
CREATE INDEX "leave_approvals_approverId_idx" ON "leave_approvals"("approverId");

-- CreateIndex
CREATE INDEX "leave_balances_leaveTypeId_idx" ON "leave_balances"("leaveTypeId");

-- CreateIndex
CREATE INDEX "lifecycle_events_approvedById_idx" ON "lifecycle_events"("approvedById");

-- CreateIndex
CREATE INDEX "payslip_details_componentId_idx" ON "payslip_details"("componentId");

-- CreateIndex
CREATE INDEX "performance_reviews_reviewerId_idx" ON "performance_reviews"("reviewerId");

-- CreateIndex
CREATE INDEX "positions_departmentId_idx" ON "positions"("departmentId");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "training_programs_status_idx" ON "training_programs"("status");

-- CreateIndex
CREATE INDEX "training_programs_createdById_idx" ON "training_programs"("createdById");

-- CreateIndex
CREATE INDEX "training_programs_startDate_idx" ON "training_programs"("startDate");

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifecycle_events" ADD CONSTRAINT "lifecycle_events_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_advances" ADD CONSTRAINT "employee_advances_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_claims" ADD CONSTRAINT "expense_claims_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
