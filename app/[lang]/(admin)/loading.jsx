"use client";
import { Spinner } from "@/components/ui/Spinner";

export default function loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center text-3xl">
      <Spinner size="lg" />
    </div>
  );
}
