"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useEmployees, useCreateEmployee } from "@/hooks/use-employees";
import { useDepartments } from "@/hooks/use-departments";
import { usePositions } from "@/hooks/use-positions";
import { buttonVariants } from "@/components/ui/button";
import type { PtkpStatus } from "@prisma/client";

import {
  EmployeeForm,
  StepIndicator,
  INITIAL_FORM,
  type EmployeeFormData,
} from "@/components/employees/employee-form";

export default function NewEmployeePage() {
  const router = useRouter();
  const { departments } = useDepartments();
  const { positions } = usePositions();
  const { employees: allEmployees } = useEmployees({ limit: 200 });
  const createMutation = useCreateEmployee();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<EmployeeFormData>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const filteredPositions = positions.filter(
    (p) => p.departmentId === form.departmentId && p.isActive,
  );

  const activeEmployees = allEmployees.filter((e) => e.status === "ACTIVE");

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
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  }

  function handlePrevious() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }

  async function handleSubmit() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error("Format email tidak valid");
      return;
    }

    if (!form.departmentId) {
      toast.error("Departemen wajib dipilih");
      return;
    }
    if (!form.positionId) {
      toast.error("Jabatan wajib dipilih");
      return;
    }

    const maxNum = allEmployees.reduce((max, e) => {
      const match = e.employeeNumber?.match(/EMP-(\d+)/);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const empNumber = `EMP-${String(maxNum + 1).padStart(4, "0")}`;

    setSaving(true);
    try {
      await createMutation.trigger({
        employeeNumber: empNumber,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender as "MALE" | "FEMALE",
        dateOfBirth: form.dateOfBirth,
        placeOfBirth: form.placeOfBirth.trim(),
        religion: (form.religion || undefined) as "ISLAM" | "KRISTEN" | "KATOLIK" | "HINDU" | "BUDDHA" | "KONGHUCU" | "LAINNYA" | undefined,
        maritalStatus: form.maritalStatus as "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED",
        dependents: form.dependents ? Number(form.dependents) : 0,
        nik: form.nik.trim(),
        npwp: form.npwp.trim() || undefined,
        bpjsKesNumber: form.bpjsKesNumber.trim() || undefined,
        bpjsTkNumber: form.bpjsTkNumber.trim() || undefined,
        bankName: form.bankName || undefined,
        bankAccountNo: form.bankAccountNo.trim() || undefined,
        bankAccountName: form.bankAccountName.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        province: form.province.trim() || undefined,
        postalCode: form.postalCode.trim() || undefined,
        emergencyName: form.emergencyName.trim() || undefined,
        emergencyPhone: form.emergencyPhone.trim() || undefined,
        emergencyRelation: form.emergencyRelation.trim() || undefined,
        departmentId: form.departmentId,
        positionId: form.positionId,
        managerId: form.managerId || null,
        status: "ACTIVE" as const,
        type: (form.type || "PERMANENT") as "PERMANENT" | "CONTRACT" | "PROBATION" | "INTERNSHIP",
        joinDate: form.joinDate || new Date().toISOString().split("T")[0],
        endDate: form.endDate || null,
        ptkpStatus: (form.ptkpStatus || "TK0") as PtkpStatus,
        taxMethod: (form.taxMethod || "GROSS") as "GROSS" | "GROSS_UP" | "NETT",
      });
      toast.success("Karyawan berhasil ditambahkan");
      router.push("/employees");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/employees" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Tambah Karyawan Baru
          </h1>
          <p className="text-sm text-muted-foreground">
            Lengkapi data karyawan dalam 3 langkah
          </p>
        </div>
      </div>

      <StepIndicator currentStep={currentStep} />

      <EmployeeForm
        mode="new"
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
