"use client";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/react";
import Button from "../../ui/Button";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import { CalendarIcon } from "../../ui/svgs/icons/CalendarIconSvg";
import ConfirmModal from "../ConfirmModal";
import { revalidateWithTag } from "@/actions/revalidateTag";

function HolidayRow({ period, index, onEdit, onDelete, lang }) {
  const fmt = (d) =>
    new Date(d).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-GB");
  return (
    <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-darkNavy flex items-center gap-1.5">
          {fmt(period.from)}
          <svg
            className={`w-3.5 h-3.5 text-gray-400 shrink-0 ${
              lang === "ar" ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
          {fmt(period.to)}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {/* Edit Button */}
        <button
          type="button"
          onClick={() => onEdit(index)}
          className="text-gray-400 hover:text-primary transition-colors p-1.5 hover:bg-orange-50 rounded-lg"
          aria-label="Edit holiday period"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
          </svg>
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
          aria-label="Delete holiday period"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function HolidayManager({ user, setUser, t, lang }) {
  const [periods, setPeriods] = useState(user?.holidayPeriods || []);
  const [newRange, setNewRange] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // Delete modal state
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (user?.holidayPeriods) {
      setPeriods(user.holidayPeriods);
    }
  }, [user]);

  const revalidateProducts = async () => {
    try {
      const res = await fetch(`/api/products?userId=${user._id}&fields=_id`);
      const data = await res.json();
      if (data.success) {
        await Promise.all(
          data.data.map((product) =>
            revalidateWithTag(`product-${product._id}`),
          ),
        );
      }
    } catch (error) {
      console.error("Error revalidating products:", error);
    }
  };

  const savePeriods = async (updatedPeriods) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holidayPeriods: updatedPeriods }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("holidayManager.error"));
      setUser(data.data);
      setPeriods(data.data.holidayPeriods || []);
      toast.success(ToastMessage(t("holidayManager.saveSuccess")));
      await revalidateProducts();
    } catch (err) {
      toast.error(ToastMessage(err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newRange?.from) return;

    let updatedPeriods;
    if (editingIndex !== null) {
      updatedPeriods = periods.map((p, idx) =>
        idx === editingIndex
          ? { from: newRange.from, to: newRange.to || newRange.from }
          : p,
      );
      setEditingIndex(null);
    } else {
      const newPeriod = {
        from: newRange.from,
        to: newRange.to || newRange.from,
      };
      updatedPeriods = [...periods, newPeriod];
    }

    setNewRange({});
    await savePeriods(updatedPeriods);
  };

  const handleEdit = (idx) => {
    const period = periods[idx];
    setNewRange({
      from: new Date(period.from),
      to: new Date(period.to),
    });
    setEditingIndex(idx);
  };

  const handleDeleteClick = (idx) => {
    setDeleteIndex(idx);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteIndex === null) return;
    const updatedPeriods = periods.filter((_, idx) => idx !== deleteIndex);
    setIsDeleteModalOpen(false);
    setDeleteIndex(null);
    await savePeriods(updatedPeriods);
  };

  return (
    <div className="md:p-10 p-4 bg-white md:mt-6 mt-4 rounded-lg">
      <h2 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.05rem] font-semibold text-darkNavy font-IBMPlex mb-1">
        {t("holidayManager.title")}
      </h2>
      <p className="text-sm text-gray-500 mb-6">{t("holidayManager.desc")}</p>

      {/* Add new period */}
      <div className="bg-[#FDF5EE] border border-primary/20 rounded-2xl p-4 mb-6">
        <p className="text-sm font-semibold text-darkNavy mb-3">
          {editingIndex !== null
            ? t("holidayManager.editPeriod")
            : t("holidayManager.addPeriod")}
        </p>
        <div className="flex flex-col md:flex-row gap-3">
          {/* Date range picker */}
          <Popover
            placement="bottom-start"
            offset={8}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
          >
            <PopoverTrigger>
              <button
                type="button"
                className="flex-1 flex items-center gap-2 bg-white border border-primary/40 hover:border-primary rounded-xl px-4 py-3 text-sm transition-colors"
              >
                <CalendarIcon className="w-4 h-4 shrink-0" color="#F48A42" />
                <span className="text-gray-700 flex-1 flex items-center gap-1.5 text-start">
                  {!newRange?.from ? (
                    t("holidayManager.selectRange")
                  ) : (
                    <>
                      {new Date(newRange.from).toLocaleDateString(
                        lang === "ar" ? "ar-SA" : "en-GB",
                      )}
                      <svg
                        className={`w-3.5 h-3.5 text-gray-400 shrink-0 ${
                          lang === "ar" ? "rotate-180" : ""
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                      {new Date(
                        newRange.to || newRange.from,
                      ).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-GB")}
                    </>
                  )}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="p-0 md:w-[28rem] w-[90vw] max-w-full">
              <Calendar
                selected={newRange}
                mode="range"
                lang={lang}
                onSelect={(range) => {
                  if (!range) return setNewRange({});
                  setNewRange({
                    from: range.from,
                    to: range.to || range.from,
                  });
                  if (range.to) setIsOpen(false);
                }}
                disabled={[{ before: new Date() }]}
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2 shrink-0">
            {editingIndex !== null && (
              <Button
                variant="light"
                onPress={() => {
                  setEditingIndex(null);
                  setNewRange({});
                }}
                className="md:px-4 px-3 py-3 h-auto text-sm font-semibold text-gray-500 hover:bg-gray-100"
              >
                {t("holidayManager.cancel")}
              </Button>
            )}

            <Button
              isLoading={isSaving}
              onPress={handleAdd}
              isDisabled={!newRange?.from}
              className="md:px-6 px-4 py-3 h-auto text-sm font-semibold"
            >
              {editingIndex !== null
                ? t("holidayManager.update")
                : t("holidayManager.add")}
            </Button>
          </div>
        </div>
      </div>

      {/* Existing periods list */}
      <div className="flex flex-col gap-2 mb-6 min-h-[40px]">
        {periods.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            {t("holidayManager.noPeriods")}
          </p>
        ) : (
          periods.map((period, idx) => (
            <HolidayRow
              key={idx}
              period={period}
              index={idx}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              lang={lang}
            />
          ))
        )}
      </div>

      {/* Confirm Modal */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeleteIndex(null);
          }}
          onConfirm={handleConfirmDelete}
          title={t("holidayManager.deleteConfirmTitle")}
          message={t("holidayManager.deleteConfirmMessage")}
          confirmText={t("holidayManager.delete")}
          cancelText={t("holidayManager.cancel")}
          type="delete"
          loading={isSaving}
          t={t}
        />
      )}
    </div>
  );
}
