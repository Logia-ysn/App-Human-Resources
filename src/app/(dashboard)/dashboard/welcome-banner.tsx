"use client";

import { useAppStore } from "@/lib/store/app-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles, PlayCircle, FileX2 } from "lucide-react";

export function WelcomeBanner() {
  const employees = useAppStore((s) => s.employees);
  const hasBeenInitialized = useAppStore((s) => s.hasBeenInitialized);
  const restoreDemoData = useAppStore((s) => s.restoreDemoData);

  // Only show when the store has been initialized AND there are no employees
  // (i.e., user cleared data or it's a fresh start)
  if (!hasBeenInitialized || employees.length > 0) {
    return null;
  }

  function handleStartWithDemo() {
    restoreDemoData();
    toast.success("Data demo berhasil dimuat");
  }

  function handleStartFresh() {
    // Already in empty state, just dismiss by marking as initialized
    // The banner will disappear since employees array stays empty,
    // but we mark a flag in localStorage so it doesn't reappear
    if (typeof window !== "undefined") {
      localStorage.setItem("hris-welcome-dismissed", "true");
    }
    // Force re-render
    window.dispatchEvent(new Event("storage"));
    toast.success("Siap memulai dari awal");
  }

  // Check if user already dismissed the welcome banner
  if (typeof window !== "undefined") {
    const dismissed = localStorage.getItem("hris-welcome-dismissed");
    if (dismissed === "true") {
      return null;
    }
  }

  return (
    <Card className="border-dashed border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Sparkles className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl">Selamat Datang di HRIS</CardTitle>
        <CardDescription className="text-sm">
          Mulai dengan data demo untuk eksplorasi, atau mulai dari awal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={handleStartWithDemo}>
            <PlayCircle className="mr-1.5 h-4 w-4" data-icon="inline-start" />
            Mulai dengan Data Demo
          </Button>
          <Button variant="outline" size="lg" onClick={handleStartFresh}>
            <FileX2 className="mr-1.5 h-4 w-4" data-icon="inline-start" />
            Mulai dari Awal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
