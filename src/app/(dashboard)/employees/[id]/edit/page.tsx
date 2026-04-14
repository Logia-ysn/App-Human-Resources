"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { PtkpStatus } from "@prisma/client";

import { cn } from "@/lib/utils";
import { useEmployee, useEmployees, useUpdateEmployee } from "@/hooks/use-employees";
import { useDepartments } from "@/hooks/use-departments";
import { usePositions } from "@/hooks/use-positions";
import { buttonVariants } from "@/components/ui/button";

import {
  EmployeeForm,
  StepIndicator,
  type EmployeeFormData,
} from "@/components/employees/employee-form";

export default function EditEmployeePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { employee, isLoading: empLoading } = useEmployee(params.id);
  const { departments } = useDepartments();
  const { positions } = usePositions();
  const { employees: allEmployees } = useEmployees({ limit: 200 });
  const updateMutation = useUpdateEmployee(params.id);
  const [saving, setSaving] = useState(false);

  const salaryComponents = (employee as Record<string, unknown> | undefined)?.salaryComponents as
    | Array<{ amount: unknown; component: { code: string } }>
    | undefined;

  const getSalaryAmount = (code: string): number => {
    const comp = salaryComponents?.find((sc) => sc.component.code === code);
    return comp ? Number(comp.amount) : 0;
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<EmployeeFormData>({} as EmployeeFormData);
  const [formInitialized, setFormInitialized] = useState(false);

  if (employee && !formInitialized) {
    const toDateStr = (d: string | Date | null) => {
      if (!d) return "";
      return new Date(d).toISOString().split("T")[0];
    };

    setForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone ?? "",
      gender: employee.gender,
      dateOfBirth: toDateStr(employee.dateOfBirth),
      placeOfBirth: employee.placeOfBirth,
      religion: employee.religion ?? "",
      maritalStatus: employee.maritalStatus,
      dependents: String(employee.dependents),
      nik: employee.nik,
      address: employee.address ?? "",
      city: employee.city ?? "",
      province: employee.province ?? "",
      postalCode: employee.postalCode ?? "",
      emergencyName: employee.emergencyName ?? "",
      emergencyPhone: employee.emergencyPhone ?? "",
      emergencyRelation: employee.emergencyRelation ?? "",
      departmentId: employee.departmentId,
      positionId: employee.positionId,
      managerId: employee.managerId ?? "",
      type: employee.type,
      joinDate: toDateStr(employee.joinDate),
      endDate: toDateStr(employee.endDate),
      basicSalary: String(getSalaryAmount("BASIC")),
      allowanceTransport: String(getSalaryAmount("TRANSPORT")),
      allowanceMeal: String(getSalaryAmount("MEAL")),
      allowancePosition: String(getSalaryAmount("POSITION")),
      allowanceOther: String(getSalaryAmount("OTHER")),
      npwp: employee.npwp ?? "",
      ptkpStatus: employee.ptkpStatus as PtkpStatus,
      taxMethod: employee.taxMethod,
      bpjsKesNumber: employee.bpjsKesNumber ?? "",
      bpjsTkNumber: employee.bpjsTkNumber ?? "",
      bankName: employee.bankName ?? "",
      bankAccountNo: employee.bankAccountNo ?? "",
      bankAccountName: employee.bankAccountName ?? "",
    });
    setFormInitialized(true);
  }

  const filteredPositions = positions.filter(
    (p) => p.departmentId === form.departmentId && p.isActive,
  );

  const activeEmployees = allEmployees.filter(
    (e) => e.status === "ACTIVE" && e.id !== params.id,
  );

  const showEndDate =
    form.type === "CONTRACT" ||
    form.type === "PROBATION" ||
    form.type === "INTERNSHIP";

  function handleChange(field: keyof EmployeeFormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "departmentId") {
        return { ...next, positionId: "" };
      }
      if (field === "type" && !["CONTRACT", "PROBATION", "INTERNSHIP"].includes(value)) {
        return { ...next, endDate: "" };
      }
      return next;
    });
  }

  function handleNext() {
    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  }

  function handlePrevious() {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  }

  async function handleSubmit() {
    if (!employee) return;
    setSaving(true);

    try {
      await updateMutation.trigger({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        gender: form.gender as "MALE" | "FEMALE",
        dateOfBirth: form.dateOfBirth,
        placeOfBirth: form.placeOfBirth,
        religion: form.religion as "ISLAM" | "KRISTEN" | "KATOLIK" | "HINDU" | "BUDDHA" | "KONGHUCU" | "LAINNYA" | undefined,
        maritalStatus: form.maritalStatus as "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED",
        dependents: Number(form.dependents) || 0,
        nik: form.nik,
        address: form.address,
        city: form.city,
        province: form.province,
        postalCode: form.postalCode,
        emergencyName: form.emergencyName,
        emergencyPhone: form.emergencyPhone,
        emergencyRelation: form.emergencyRelation,
        departmentId: form.departmentId,
        positionId: form.positionId,
        managerId: form.managerId || null,
        type: form.type as "PERMANENT" | "CONTRACT" | "PROBATION" | "INTERNSHIP",
        joinDate: form.joinDate,
        endDate: form.endDate || null,
        npwp: form.npwp,
        ptkpStatus: form.ptkpStatus as PtkpStatus,
        taxMethod: form.taxMethod as "GROSS" | "GROSS_UP" | "NETT",
        bpjsKesNumber: form.bpjsKesNumber,
        bpjsTkNumber: form.bpjsTkNumber,
        bankName: form.bankName,
        bankAccountNo: form.bankAccountNo,
        bankAccountName: form.bankAccountName,
      });
      toast.success("Data karyawan berhasil diperbarui");
      router.push(`/employees/${employee.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  if (empLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <h2 className="text-xl font-semibold">Karyawan tidak ditemukan</h2>
        <p className="text-muted-foreground">
          Data karyawan dengan ID tersebut tidak ditemukan atau telah dihapus.
        </p>
        <Link href="/employees" className={cn(buttonVariants({ variant: "outline" }))}>
          <ArrowLeft data-icon="inline-start" />
          Kembali ke Data Karyawan
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/employees/${employee.id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Edit Karyawan
          </h1>
          <p className="text-sm text-muted-foreground">
            {employee.firstName} {employee.lastName} — {employee.employeeNumber}
          </p>
        </div>
      </div>

      <StepIndicator currentStep={currentStep} />

      <EmployeeForm
        mode="edit"
        form={form}
        currentStep={currentStep}
        saving={saving}
        departments={departments}
        filteredPositions={filteredPositions}
        activeEmployees={activeEmployees}
        showEndDate={showEndDate}
        handleChange={handleChange}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
