"use client";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Chip,
} from "@heroui/react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import Image from "next/image";
import { anyImgUrl } from "@/utils/ImageUrl";

export default function AdminProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [emailLang, setEmailLang] = useState("ar");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [previewImage, setPreviewImage] = useState(null);

  const fetchProposals = async (page = 1, status = "") => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("page", page);
      queryParams.append("limit", pagination.limit);
      if (status) queryParams.append("status", status);

      const res = await fetch(`/api/proposal?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setProposals(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching proposal:", error);
      toast.error(ToastMessage("حدث خطأ أثناء جلب العروض"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleMarkAsRead = (id) =>
    startTransition(async () => {
      try {
        const res = await fetch(`/api/proposal/${id}/read`, {
          method: "PATCH",
        });
        const data = await res.json();
        if (data.success) {
          setProposals(
            proposals.map((proposal) =>
              proposal._id === id ? { ...proposal, status: "read" } : proposal,
            ),
          );
          toast.success(ToastMessage("تم تحديث حالة الرسالة بنجاح"));
        }
      } catch (error) {
        toast.error(ToastMessage("حدث خطأ ما"));
      }
    });

  const handleReplyModalOpen = (proposal) => {
    setSelectedProposal(proposal);
  };

  const handleReplyModalClose = () => {
    setSelectedProposal(null);
    setReplyMessage("");
  };

  const handleReply = () => {
    if (!selectedProposal || !replyMessage) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/proposal/${selectedProposal._id}/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: replyMessage, lang: emailLang }),
        });
        const data = await res.json();
        if (data.success) {
          setProposals(
            proposals.map((proposal) =>
              proposal._id === selectedProposal._id
                ? { ...proposal, status: "replied" }
                : proposal,
            ),
          );
          toast.success(ToastMessage("تم الرد على الرسالة بنجاح"));
          handleReplyModalClose();
        }
      } catch (error) {
        toast.error(ToastMessage("حدث خطأ ما"));
      }
    });
  };

  const handlePageChange = (page) => {
    fetchProposals(page);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "warning";
      case "read":
        return "primary";
      case "replied":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "new":
        return "جديدة";
      case "read":
        return "مقروءة";
      case "replied":
        return "تم الرد";
      default:
        return status;
    }
  };

  if (loading && proposals.length === 0) return <div>Loading...</div>;

  return (
    <div className="px-1 md:px-4 pt-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-6">
        <h1 className="text-2xl font-bold">طلبات العروض</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            color="primary"
            onPress={() => fetchProposals(1, "")}
            isDisabled={isPending}
          >
            الكل
          </Button>
          <Button
            color="warning"
            onPress={() => fetchProposals(1, "new")}
            isDisabled={isPending}
          >
            الجديدة
          </Button>
          <Button
            color="success"
            onPress={() => fetchProposals(1, "read")}
            isDisabled={isPending}
          >
            المقروءة
          </Button>
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl">لا توجد عروض</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1">
          {proposals.map((proposal) => (
            <div
              key={proposal._id}
              className="border p-4 rounded-lg bg-white shadow-sm"
            >
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <h2 className="text-xl font-semibold">{proposal.subject}</h2>
                <Chip color={getStatusColor(proposal.status)}>
                  {getStatusText(proposal.status)}
                </Chip>
              </div>
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">الاسم:</span> {proposal.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">عنوان المشروع:</span>{" "}
                  {proposal.title}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">البريد الإلكتروني:</span>{" "}
                  {proposal.email}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">رقم الهاتف:</span>{" "}
                  {proposal.phone}
                </p>
                {proposal.budget !== 0 && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">الميزانيه:</span>{" "}
                    {proposal.budget}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">التاريخ:</span>{" "}
                  {new Date(proposal.createdAt).toLocaleString("en-EN")}
                </p>
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded break-words">
                <p>{proposal.description}</p>
              </div>
              {/* Images section */}
              {proposal.images && proposal.images.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold mb-2">الصور التوضيحيه:</p>
                  <div className="flex flex-wrap gap-3">
                    {proposal.images.map((img, index) => (
                      <div
                        key={index}
                        className="w-24 h-24 relative rounded-lg overflow-hidden border cursor-pointer"
                        style={{
                          background: img.gradientStyle || "none",
                          backgroundImage: img.gradientColors?.length
                            ? `linear-gradient(${img.gradientColors.join(",")})`
                            : undefined,
                        }}
                        onClick={() => setPreviewImage(img.preview)}
                      >
                        <Image
                          src={anyImgUrl({
                            src: img.preview,
                            size: 200,
                            quality: 60,
                          })}
                          unoptimized
                          fill
                          alt={`Proposal Image ${index + 1}`}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {proposal.status === "new" && (
                  <Button
                    color="primary"
                    onPress={() => handleMarkAsRead(proposal._id)}
                    isDisabled={isPending}
                  >
                    تحديد كمقروءة
                  </Button>
                )}
                {!proposal.replay ? (
                  <Button
                    color="success"
                    onPress={() => handleReplyModalOpen(proposal)}
                    isDisabled={isPending}
                  >
                    الرد
                  </Button>
                ) : (
                  <div>
                    <p className="mb-1">الرد:</p>
                    <p className="mb-4 p-3 rounded bg-gray-50">
                      {proposal.replay}
                    </p>
                  </div>
                )}
                {proposal.pdfLink !== "" && (
                  <Button
                    color="primary"
                    isDisabled={isPending}
                    href={proposal.pdfLink}
                    as="a"
                    target="_blank"
                  >
                    ملف PDF
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  size="sm"
                  color={pagination.page === page ? "primary" : "default"}
                  onPress={() => handlePageChange(page)}
                  isDisabled={isPending}
                >
                  {page}
                </Button>
              ),
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        size="full"
        placement="center"
        className="bg-black/90"
      >
        <ModalContent>
          <ModalBody className="flex justify-center items-center h-screen p-4">
            {previewImage && (
              <Image
                src={anyImgUrl({
                  src: previewImage,
                  size: 1200,
                  quality: 60,
                })}
                alt="Preview"
                width={1200}
                height={800}
                unoptimized
                className="object-contain max-w-full max-h-[90vh] sm:max-h-[95vh] rounded-lg"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={!!selectedProposal}
        onClose={handleReplyModalClose}
        placement="center"
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-wrap items-center justify-between gap-4 pl-16">
            <span className="font-semibold">الرد على العرض</span>

            {/* Language toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">لغة البريد</span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  color="warning"
                  variant={emailLang === "ar" ? "solid" : "ghost"}
                  onPress={() => setEmailLang("ar")}
                  aria-pressed={emailLang === "ar"}
                  title="Arabic"
                >
                  AR
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  variant={emailLang === "en" ? "solid" : "ghost"}
                  onPress={() => setEmailLang("en")}
                  aria-pressed={emailLang === "en"}
                  title="English"
                >
                  EN
                </Button>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedProposal && (
              <div className="mb-4">
                <p className="text-sm">
                  <span className="font-semibold">من:</span>{" "}
                  {selectedProposal.name} ({selectedProposal.email})
                </p>
                <p className="text-sm">
                  <span className="font-semibold">الموضوع:</span>{" "}
                  {selectedProposal.subject}
                </p>
                <div className="mt-2 p-3 bg-gray-50 rounded line-clamp-1">
                  <p>{selectedProposal.description}</p>
                </div>
              </div>
            )}

            <Textarea
              label="رسالة الرد"
              placeholder="اكتب رسالة الرد هنا..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              minRows={5}
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={handleReplyModalClose}
            >
              إلغاء
            </Button>
            <Button
              color="success"
              onPress={handleReply}
              isDisabled={!replyMessage || isPending}
            >
              إرسال الرد
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
