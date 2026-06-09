"use client";
import { useState, useEffect, useRef } from "react";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import { toast } from "@/utils/toast";
import { Textarea } from "@heroui/react";
import { Send } from "@/components/ui/svgs/icons/SendSvg";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("ar-EG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminNotesModal({ order, onClose }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const bottomRef = useRef(null);
  const editRef = useRef(null);

  // Fetch notes on mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`/api/orders/${order._id}/notes`);
        const data = await res.json();
        if (data.success) setNotes(data.data);
        else toast.error("فشل تحميل الملاحظات");
      } catch {
        toast.error("حدث خطأ أثناء تحميل الملاحظات");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [order._id]);

  // Scroll to bottom when notes change
  useEffect(() => {
    if (!loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [notes, loading]);

  // Focus edit textarea when entering edit mode
  useEffect(() => {
    if (editingNoteId) editRef.current?.focus();
  }, [editingNoteId]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleAdd = async () => {
    const trimmed = newNote.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes(data.data);
        setNewNote("");
        toast.success("تمت إضافة الملاحظة");
      } else {
        toast.error(data.error || "فشل إضافة الملاحظة");
      }
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (note) => {
    setEditingNoteId(note._id);
    setEditingText(note.note);
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditingText("");
  };

  const handleEdit = async (noteId) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, note: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes(data.data);
        cancelEdit();
        toast.success("تم تعديل الملاحظة");
      } else {
        toast.error(data.error || "فشل تعديل الملاحظة");
      }
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId) => {
    setDeletingNoteId(noteId);
    try {
      const res = await fetch(`/api/orders/${order._id}/notes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes(data.data);
        toast.success("تم حذف الملاحظة");
      } else {
        toast.error(data.error || "فشل حذف الملاحظة");
      }
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setDeletingNoteId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between md:px-6 md:py-4 px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-0.5 h-5 md:w-1 md:h-6 rounded-full bg-[#f48a42]" />
            <div>
              <h2 className="font-bold text-darkNavy text-sm md:text-base font-IBMPlex">
                ملاحظات الإدارة
              </h2>
              <p className="text-[11px] md:text-xs text-gray-400 mt-0.5">
                طلب #
                {order.contractId || String(order._id).slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:w-8 md:h-8 w-7 h-7 md:rounded-xl rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="md:w-4 md:h-4 w-3.5 h-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto md:px-6 md:py-4 px-3 py-3 space-y-2 bg-gray-50/60">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-3 border-[#f48a42]/30 border-t-[#f48a42] rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center gap-3">
              <div className="md:w-14 md:h-14 w-12 h-12 rounded-2xl bg-[#FDF5EE] flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7 text-[#f48a42]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-xs md:text-sm font-medium">
                لا توجد ملاحظات بعد
              </p>
              <p className="text-gray-400 text-[11px] md:text-xs">
                أضف أول ملاحظة على هذا الطلب
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden group transition-shadow hover:shadow-sm"
              >
                {editingNoteId === note._id ? (
                  /* Edit mode */
                  <div className="md:p-4 p-3 space-y-3">
                    <textarea
                      ref={editRef}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full text-xs md:text-sm text-darkNavy bg-gray-50 border border-gray-200 rounded-lg p-3 outline-none focus:border-[#f48a42] resize-none transition-colors"
                      rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-1.5 text-xs font-bold rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={() => handleEdit(note._id)}
                        disabled={submitting || !editingText.trim()}
                        className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#f48a42] text-white hover:bg-[#f48a42]/90 disabled:opacity-50 transition-colors"
                      >
                        {submitting ? "حفظ..." : "حفظ التعديل"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="md:p-4 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#FDF5EE] overflow-hidden shrink-0 flex items-center justify-center">
                        {note.userId?.avatar ? (
                          <Image
                            src={anyImgUrl({ src: note.userId.avatar })}
                            alt=""
                            width={28}
                            height={28}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[#f48a42] text-xs font-bold">
                            {note.userId?.fullName?.charAt(0) ?? "A"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-darkNavy truncate block">
                          {note.userId?.fullName ?? "مسؤول"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatDate(note.addedAt)}
                        </span>
                      </div>
                      {/* Actions - visible on hover */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={() => startEdit(note)}
                          className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-[#FDF5EE] text-gray-400 hover:text-[#f48a42] flex items-center justify-center transition-colors"
                          title="تعديل"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(note._id)}
                          disabled={deletingNoteId === note._id}
                          className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50"
                          title="حذف"
                        >
                          {deletingNoteId === note._id ? (
                            <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {note.note}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Add Note Input */}
        <div className="md:px-6 md:py-4 px-4 py-3 border-t border-gray-100 bg-white shrink-0">
          <div className="flex items-end gap-1">
            <Textarea
              minRows={1}
              maxRows={6}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (newNote.trim()) handleAdd();
                }
              }}
              placeholder="اكتب ملاحظة جديدة..."
              className="flex-1"
            />

            <button
              onClick={handleAdd}
              disabled={submitting || !newNote.trim()}
              className="bg-transparent font-semibold rounded-full p-2 h-10 px-4 me-1 mb-1 min-w-0 flex items-center justify-center gap-1 shadow-none transition-transform duration-200 hover:scale-105 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-[#f48a42]/30 border-t-[#f48a42] rounded-full animate-spin" />
              ) : (
                <>
                  <span
                    className={`${
                      newNote.trim() ? "text-primary" : "text-gray-300"
                    } hidden md:inline`}
                  >
                    إضافة
                  </span>
                  <div className="transform -rotate-45 rtl:rotate-135">
                    <Send
                      className="md:w-[22px] md:h-[22px] w-4 h-4"
                      color={!newNote.trim() ? "#d1d5db" : "#f48a42"}
                    />
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
