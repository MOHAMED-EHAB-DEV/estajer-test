import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@heroui/react";
import { useState } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "../ui/ToastMessage";
import Button from "../ui/Button";

export default function SupplierModal({
  isOpen,
  onClose,
  setUser,
  user,
  translate,
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ iban: "", unifiedNumber: "" });
  const t = (text) => translate(`supplierModal.${text}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.iban) return toast.error(ToastMessage(t("allFieldsRequired")));
    if (user?.accountType === "company" && !data.unifiedNumber) {
      return toast.error(ToastMessage(t("unifiedNumberCompanyRequired")));
    }
    setLoading(true);
    try {
      const requestBody = { iban: data.iban.replace(/\s/g, "") };
      if (user?.accountType === "company") {
        requestBody.unifiedNumber = data.unifiedNumber.replace(/\s/g, "");
      }
      if (user?._id) {
        requestBody.userId = user._id;
      }

      const res = await fetch("/api/users/update-iban", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || t("error"));

      setUser(result.data);
      toast.success(ToastMessage(t("success")));
      onClose();
    } catch (err) {
      toast.error(ToastMessage(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      hideCloseButton
      classNames={{
        base: "bg-white",
        backdrop: "bg-black/50 backdrop-blur-sm",
      }}
    >
      <ModalContent className="overflow-hidden">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{t("title")}</h2>
                <p className="text-blue-100 text-sm">{t("desc")}</p>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="p-0">
            <div className="p-6 space-y-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("accountInfo")}
                </h3>
                <p className="text-gray-600">{t("accountInfoDesc")}</p>
              </div>
              <div className="">
                <Input
                  type="text"
                  label={t("iban")}
                  placeholder="SA0000000000000000000000"
                  value={data.iban}
                  onValueChange={(value) => setData({ ...data, iban: value })}
                  disabled={loading}
                  classNames={{
                    input: "text-lg",
                    inputWrapper:
                      "h-14 border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500",
                  }}
                  startContent={
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  }
                />
              </div>

              {user?.accountType === "company" && (
                <div className="">
                  <Input
                    type="number"
                    label={t("unifiedNumber")}
                    placeholder="7000000000"
                    value={data.unifiedNumber}
                    onValueChange={(value) =>
                      setData({ ...data, unifiedNumber: value })
                    }
                    disabled={loading}
                    classNames={{
                      input: "text-lg",
                      inputWrapper:
                        "h-14 border-2 border-gray-200 hover:border-blue-400 focus-within:border-blue-500",
                    }}
                    startContent={
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    }
                  />
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-medium text-amber-900 mb-1">
                      {t("importantInformationTitle")}
                    </h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      {t("importantNotes")?.map((note, index) => (
                        <li key={index}>• {note}</li>
                      ))}
                      {user?.accountType === "company" && (
                        <li>• {t("companyNote")}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex justify-between items-center w-full">
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                className="px-6 py-2"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                isLoading={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {loading ? (
                  t("loading")
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 me-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    {t("addData")}
                  </>
                )}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
