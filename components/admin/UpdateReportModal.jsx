"use client";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";

export default function UpdateReportModal({
  isOpen,
  onClose,
  selectedReport,
  newStatus,
  setNewStatus,
  adminNotes,
  setAdminNotes,
  onUpdate,
  isPending,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          تحديث تقرير الضرر
        </ModalHeader>
        <ModalBody>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  حالة التقرير
                </label>
                <Select
                  value={newStatus}
                  selectedKeys={[newStatus]}
                  onChange={(e) => setNewStatus(e.target.value)}
                  placeholder="اختر الحالة"
                >
                  <SelectItem key="pending" value="pending">
                    معلق
                  </SelectItem>
                  <SelectItem key="reviewed" value="reviewed">
                    تمت المراجعة
                  </SelectItem>
                  <SelectItem key="resolved" value="resolved">
                    تم الحل
                  </SelectItem>
                  <SelectItem key="rejected" value="rejected">
                    مرفوض
                  </SelectItem>
                </Select>
              </div>
              <Textarea
                label="ملاحظات الإدارة"
                placeholder="أضف ملاحظات الإدارة هنا..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                minRows={4}
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            إلغاء
          </Button>
          <Button color="primary" onPress={onUpdate} isDisabled={isPending}>
            تحديث
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
