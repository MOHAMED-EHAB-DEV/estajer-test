"use client";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
} from "@heroui/react";
import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import { anyImgUrl } from "@/utils/ImageUrl";
import Image from "next/image";
import revalidate from "@/actions/revalidateTag";
import FilterOptions from "@/components/admin/orders/FilterOptions";

export default function AdminRequestContainer({ translate, initialData }) {
  const [requests, setRequests] = useState(initialData || []);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectMessage, setRejectMessage] = useState("");
  const [status, setStatus] = useState("all");
  const [firstRender, setFirstRender] = useState(true);

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams({
        limit: 100,
      });

      if (status !== "all") {
        if (status === "pending") {
          params.set("approved", false);
          params.set("rejected", false);
        } else if (status === "approved") {
          params.set("approved", true);
        } else if (status === "rejected") {
          params.set("rejected", true);
        }
      } else {
        params.set("showAll", true);
      }
      const res = await fetch(`/api/requests?${params}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false);
      return;
    }

    fetchRequests();
  }, [status]);

  const handleApprove = (id) =>
    startTransition(async () => {
      try {
        const res = await fetch(`/api/requests/${id}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok) {
          setRequests(requests.filter((r) => r._id !== id));
          toast.success(ToastMessage("تم قبول الطلب بنجاح"));
          await fetchRequests();
          await revalidate("/");
          await revalidate(`/request/${id}`);
        }
      } catch (error) {
        toast.error(ToastMessage("حدث خطأ ما"));
      }
    });

  const handleRejectModalOpen = (request) => setSelectedRequest(request);

  const handleRejectModalClose = () => {
    setSelectedRequest(null);
    setRejectMessage("");
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectMessage) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/requests/${selectedRequest._id}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectMessage }),
        });
        const data = await res.json();
        if (res.ok) {
          setRequests(requests.filter((r) => r._id !== selectedRequest._id));
          toast.success(ToastMessage("تم رفض الطلب بنجاح"));
          await fetchRequests();
          handleRejectModalClose();
          await revalidate("/");
          await revalidate(`/request/${selectedRequest._id}`);
        }
      } catch (error) {
        toast.error(ToastMessage("حدث خطأ ما"));
      }
    });
  };

  const handleApproveAll = async () => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/requests/approve-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok) {
          setRequests([]);
          toast.success(ToastMessage("تم قبول جميع الطلبات"));
          await fetchRequests();
          await revalidate("/");
        }
      } catch (error) {
        toast.error(ToastMessage("حدث خطأ ما"));
      }
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-1 md:px-4 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">الطلبات المعلقة</h1>
        {requests.length > 0 && (
          <Button
            color="primary"
            onPress={handleApproveAll}
            isDisabled={isPending}
          >
            قبول جميع الطلبات
          </Button>
        )}
      </div>

      <FilterOptions
        statusOptions={[
          { key: "all" },
          { key: "pending" },
          { key: "approved" },
          { key: "rejected" },
        ]}
        status={status}
        setStatus={setStatus}
        showStatus={true}
        translate={translate}
        showDate={false}
        isShowPrintButton={false}
        showSearch={false}
      />

      {requests.length === 0 && (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500">لا توجد طلبات معلقة</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((request) => (
          <div key={request._id} className="border p-4 rounded-lg">
            <Image
              width={500}
              height={500}
              unoptimized
              src={anyImgUrl({
                src:
                  request.images[0] || "istockphoto-1147544807-612x612_nmqsvn",
                size: 500,
                quality: 60,
              })}
              alt={request.nameAr}
              className="w-full h-64 object-cover rounded mb-4"
            />
            <h2 className="text-xl font-semibold mb-2">{request.nameAr}</h2>
            <p className="text-gray-600 mb-4 line-clamp-2">
              {request.descriptionAr}
            </p>
            <div className="flex gap-2 mb-4">
              <Button
                color="success"
                className="text-white"
                onPress={() => handleApprove(request._id)}
                isDisabled={isPending}
              >
                قبول
              </Button>
              <Button
                color="danger"
                onPress={() => handleRejectModalOpen(request)}
                isDisabled={isPending}
              >
                رفض
              </Button>
              <Button
                as={Link}
                href={`/requests/preview/${request?._id}`}
                className="bg-gray-100"
                isDisabled={isPending}
              >
                التفاصيل
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedRequest}
        onClose={handleRejectModalClose}
        placement="center"
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">رفض الطلب</ModalHeader>
          <ModalBody>
            <Textarea
              label="سبب الرفض"
              placeholder="اكتب سبب رفض الطلب..."
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              minRows={3}
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={handleRejectModalClose}
            >
              إلغاء
            </Button>
            <Button
              color="danger"
              onPress={handleReject}
              isDisabled={!rejectMessage || isPending}
            >
              تأكيد الرفض
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
