"use client";
import React from "react";
import Button from "@/components/ui/Button";
import { Modal, ModalContent } from "@/components/ui/CustomModal";

export default function LeaveConfirmationModal({
  isOpen,
  onStay,
  onLeave,
  trans,
}) {
  const t = (key) => trans(`addProductPage.leaveModal.${key}`);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onStay}
      size="md"
      classNames={{
        base: "bg-white text-gray-800 border border-gray-100 shadow-2xl rounded-3xl overflow-hidden",
        backdrop: "bg-black/40 backdrop-blur-sm",
      }}
    >
      <ModalContent>
        {() => (
          <div className="p-6 md:p-7 text-start space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 text-amber-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-darkNavy font-IBMPlex">
                  {t("title")}
                </h3>
                <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <p className="text-slate-650 text-sm md:text-base leading-relaxed font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100">
              {t("description")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <Button
                variant="light"
                onClick={onLeave}
                className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600 font-bold px-6 py-3 rounded-2xl border border-red-200/60 active:scale-95 transition-all text-sm"
              >
                {t("leave")}
              </Button>
              <Button
                onClick={onStay}
                className="w-full sm:w-auto bg-gradient-to-r from-[#f48a42] to-[#f6a66a] hover:from-[#e37931] hover:to-[#e59559] text-white font-bold px-7 py-3 rounded-2xl shadow-lg shadow-[#f48a42]/20 active:scale-95 transition-all text-sm font-IBMPlex"
              >
                {t("stay")}
              </Button>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
