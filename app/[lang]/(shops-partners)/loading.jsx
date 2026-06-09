"use client";
import { Spinner } from "@heroui/react";

export default function loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center text-3xl">
      <Spinner size="lg" />
    </div>
  );
}
