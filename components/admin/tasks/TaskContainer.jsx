"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardBody,
  Button,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Avatar,
  Pagination,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Checkbox,
  CheckboxGroup,
} from "@heroui/react";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import { useTranslations } from "@/hooks/useTranslations";
import TaskModal from "./TaskModal";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import ImagePreviewModal from "@/components/admin/ImagePreviewModal";
import { format } from "date-fns";
import { arSA, enUS } from "date-fns/locale";

// SVG Icons
const PlusIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const ChevronUpIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 15l7-7 7 7"
    />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const LinkIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);

const ImageIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

// Task type options with colors
const taskTypes = [
  { key: "programming", label: "Programming", color: "primary" },
  { key: "bug", label: "Bug", color: "danger" },
  { key: "feature", label: "Feature", color: "success" },
  { key: "seo", label: "SEO", color: "warning" },
  { key: "marketing", label: "Marketing", color: "secondary" },
  { key: "ui", label: "UI", color: "primary" },
  { key: "ux", label: "UX", color: "primary" },
  { key: "design", label: "Design", color: "secondary" },
  { key: "content", label: "Content", color: "default" },
  { key: "testing", label: "Testing", color: "warning" },
  { key: "documentation", label: "Documentation", color: "default" },
  { key: "other", label: "Other", color: "default" },
];

// Task status options with colors
const taskStatuses = [
  { key: "pending", label: "Pending", color: "warning" },
  { key: "in_progress", label: "In Progress", color: "primary" },
  { key: "completed", label: "Completed", color: "success" },
  { key: "cancelled", label: "Cancelled", color: "danger" },
];

const defaultAssignedToUsers = [
  {
    avatar:
      "https://res.cloudinary.com/dhfzkadm2/image/upload/v1754841516/avatars/ncfjungpsmjxxwmt8qrs.webp",
    fullName: "Mohammed Ehab",
    _id: "69c51a11f17c3800a1eb59a7",
  },
  {
    avatar:
      "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp",
    fullName: "Esraa Saeed",
    _id: "68d0337cae0db10a703eb27c",
  },
  {
    avatar:
      "https://res.cloudinary.com/dhfzkadm2/image/upload/v1771357130/avatars/ukf0ryvktleixnul50iu.webp",
    fullName: "Alaa Elbana",
    _id: "67d6b00f3fc5156ad39fc8b7",
  },
  {
    avatar:
      "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp",
    fullName: "Mohamed Yahia SEO",
    _id: "691c5320da99aa70433dce89",
  },
  {
    avatar:
      "https://res.cloudinary.com/dhfzkadm2/image/upload/v1743813573/download_z9xvlw.webp",
    fullName: "محمد ناجي",
    _id: "69074a2147fbe3bd807974d9",
  },
];

const TaskContainer = ({ initialData, translate, lang }) => {
  const t = useTranslations(translate);
  const router = useRouter();
  const searchParamsHook = useSearchParams();

  const [tasks, setTasks] = useState(initialData.tasks);
  const [totalTasks, setTotalTasks] = useState(initialData.totalTasks);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tempAssignments, setTempAssignments] = useState({});
  const [modalData, setModalData] = useState({
    isOpen: false,
  });

  // Modal states
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    setTasks(initialData.tasks);
    setTotalTasks(initialData.totalTasks);
    setTotalPages(initialData.totalPages);
    setCurrentPage(initialData.currentPage);
  }, [initialData]);

  const refreshData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParamsHook.toString());
      const response = await fetch(`/api/tasks?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTasks(data.data);
        setTotalTasks(data.pagination?.total || 0);
        setTotalPages(data.pagination?.pages || 1);
        setCurrentPage(data.pagination?.page || 1);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleCreateTask = async (taskData) => {
    try {
      setSubmitting(true);
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(ToastMessage(t("admin.tasks.success.created")));
        onCreateClose();
        refreshData();
      } else {
        toast.error(
          ToastMessage(data.error || t("admin.tasks.errors.createFailed")),
        );
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(ToastMessage(t("admin.tasks.errors.createFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    onEditOpen();
  };

  const handleViewTask = (task) => {
    setViewingTask(task);
    onViewOpen();
  };

  const handleUpdateTask = async (taskData) => {
    if (!editingTask) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/tasks/${editingTask._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(ToastMessage(t("admin.tasks.success.updated")));
        onEditClose();
        setEditingTask(null);
        refreshData();
      } else {
        toast.error(
          ToastMessage(data.error || t("admin.tasks.errors.updateFailed")),
        );
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(ToastMessage(t("admin.tasks.errors.updateFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success(ToastMessage(t("admin.tasks.success.deleted")));
        refreshData();
      } else {
        toast.error(
          ToastMessage(data.error || t("admin.tasks.errors.deleteFailed")),
        );
      }
      setModalData({ isOpen: false });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(ToastMessage(t("admin.tasks.errors.deleteFailed")));
    }
  };

  const handlePriorityChange = async (taskId, direction) => {
    try {
      const response = await fetch("/api/tasks/priority", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, direction }),
      });

      const data = await response.json();
      if (data.success) {
        refreshData();
      } else {
        toast.error(
          ToastMessage(data.error || t("admin.tasks.errors.priorityFailed")),
        );
      }
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error(ToastMessage(t("admin.tasks.errors.priorityFailed")));
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(ToastMessage(t("admin.tasks.success.statusUpdated")));
        refreshData();
      } else {
        toast.error(
          ToastMessage(data.error || t("admin.tasks.errors.updateFailed")),
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(ToastMessage(t("admin.tasks.errors.updateFailed")));
    }
  };

  const handleAssignmentChange = async (taskId, newUserIds) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: newUserIds }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(
          ToastMessage(
            t("admin.tasks.success.assignmentUpdated") || "Assignment updated",
          ),
        );
        refreshData();
      } else {
        toast.error(
          ToastMessage(data.error || t("admin.tasks.errors.updateFailed")),
        );
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast.error(ToastMessage(t("admin.tasks.errors.updateFailed")));
    }
  };

  const handleOpenPopover = (task) => {
    setTempAssignments((prev) => ({
      ...prev,
      [task._id]: Array.isArray(task.assignedTo)
        ? task.assignedTo.map((u) => (typeof u === "string" ? u : u._id))
        : [],
    }));
  };

  const getTypeInfo = (type) =>
    taskTypes.find((t) => t.key === type) || taskTypes[taskTypes.length - 1];
  const getStatusInfo = (status) =>
    taskStatuses.find((s) => s.key === status) || taskStatuses[0];

  const formatDate = (date) => {
    if (!date) return "";
    try {
      return format(new Date(date), "dd MMM yyyy", {
        locale: lang === "ar" ? arSA : enUS,
      });
    } catch (error) {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {t("admin.tasks.totalCount")}: {totalTasks}
        </div>
        <Button
          color="primary"
          onPress={onCreateOpen}
          startContent={<PlusIcon className="w-4 h-4" />}
          className="bg-gradient-to-r from-[#f48a42] to-[#f47242] text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          {t("admin.tasks.addTask")}
        </Button>
      </div>

      {/* Tasks Table */}
      <Card className="shadow-xl border-0">
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" color="warning" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <div className="w-20 h-20 bg-gradient-to-br from-[#f48a42]/20 to-[#f47242]/20 rounded-full flex items-center justify-center mb-4">
                <CheckIcon className="w-10 h-10 text-[#f48a42]" />
              </div>
              <p className="text-lg font-medium">{t("admin.tasks.noTasks")}</p>
              <p className="text-sm text-gray-400 mt-1">
                {t("admin.tasks.noTasksDesc")}
              </p>
            </div>
          ) : (
            <>
              <Table
                aria-label="Tasks table"
                shadow="none"
                className="min-h-[400px]"
                classNames={{
                  th: "bg-gray-50/50 py-4 text-gray-600 font-bold border-b border-gray-100",
                  td: "py-4",
                  wrapper:
                    "bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm",
                }}
              >
                <TableHeader>
                  <TableColumn className="bg-gradient-to-r from-[#f48a42]/10 to-[#f47242]/10 w-1 whitespace-nowrap">
                    {t("admin.tasks.priority")}
                  </TableColumn>
                  <TableColumn className="bg-gradient-to-r from-[#f48a42]/10 to-[#f47242]/10">
                    {t("admin.tasks.title")}
                  </TableColumn>
                  <TableColumn className="bg-gradient-to-r from-[#f48a42]/10 to-[#f47242]/10 w-1 whitespace-nowrap">
                    {t("admin.tasks.type")}
                  </TableColumn>
                  <TableColumn className="bg-gradient-to-r from-[#f48a42]/10 to-[#f47242]/10 w-1 whitespace-nowrap">
                    {t("admin.tasks.status")}
                  </TableColumn>
                  <TableColumn className="bg-gradient-to-r from-[#f48a42]/10 to-[#f47242]/10 w-1 whitespace-nowrap">
                    {t("admin.tasks.createdBy")}
                  </TableColumn>
                  <TableColumn className="bg-gradient-to-r from-[#f48a42]/10 to-[#f47242]/10 w-1 whitespace-nowrap">
                    {t("admin.tasks.assignedTo")}
                  </TableColumn>
                  <TableColumn className="bg-gradient-to-r from-[#f48a42]/10 to-[#f47242]/10 w-1 whitespace-nowrap">
                    {t("admin.tasks.date")}
                  </TableColumn>
                  <TableColumn className="bg-gradient-to-r from-[#f48a42]/10 to-[#f47242]/10 w-1 whitespace-nowrap">
                    {t("admin.tasks.attachments")}
                  </TableColumn>
                  <TableColumn className="bg-gradient-to-r from-[#f48a42]/10 to-[#f47242]/10 w-1 whitespace-nowrap">
                    {t("admin.tasks.actions")}
                  </TableColumn>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => {
                    const typeInfo = getTypeInfo(task.type);
                    const statusInfo = getStatusInfo(task.status);

                    return (
                      <TableRow
                        key={task._id}
                        className="hover:bg-[#f48a42]/5 transition-colors cursor-pointer"
                        onClick={() => handleViewTask(task)}
                      >
                        <TableCell>
                          <div className="flex flex-col items-center gap-1">
                            <Button
                              size="sm"
                              isIconOnly
                              variant="flat"
                              aria-label={t("admin.tasks.priorityUp")}
                              className="min-w-6 w-6 h-6 bg-gradient-to-r from-[#f48a42]/20 to-[#f47242]/20 hover:from-[#f48a42]/40 hover:to-[#f47242]/40"
                              onPress={() =>
                                handlePriorityChange(task._id, "up")
                              }
                            >
                              <ChevronUpIcon className="w-3 h-3 text-[#f48a42]" />
                            </Button>
                            <span className="font-bold text-primary text-lg">
                              {task.priority}
                            </span>
                            <Button
                              size="sm"
                              isIconOnly
                              variant="flat"
                              aria-label={t("admin.tasks.priorityDown")}
                              className="min-w-6 w-6 h-6 bg-gradient-to-r from-[#f48a42]/20 to-[#f47242]/20 hover:from-[#f48a42]/40 hover:to-[#f47242]/40"
                              onPress={() =>
                                handlePriorityChange(task._id, "down")
                              }
                            >
                              <ChevronDownIcon className="w-3 h-3 text-[#f48a42]" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium text-gray-900 truncate">
                              {task.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {task.description?.substring(0, 60)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={typeInfo.color}
                            className="capitalize"
                          >
                            {t(`admin.tasks.types.${task.type}`) ||
                              typeInfo.label}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Select
                            size="sm"
                            selectedKeys={[task.status]}
                            aria-label={t("admin.tasks.status")}
                            onChange={(e) => {
                              handleStatusChange(task._id, e.target.value);
                            }}
                            className="min-w-32"
                            classNames={{
                              trigger: `border-${statusInfo.color}`,
                            }}
                          >
                            {taskStatuses.map((status) => (
                              <SelectItem key={status.key} value={status.key}>
                                {t(`admin.tasks.statuses.${status.key}`) ||
                                  status.label}
                              </SelectItem>
                            ))}
                          </Select>
                        </TableCell>
                        <TableCell className="w-1 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={task.createdBy?.avatar}
                              name={task.createdBy?.fullName}
                              size="sm"
                              className="ring-1 ring-gray-200"
                            />
                            <div className="flex flex-col gap-0.5">
                              <p className="text-xs font-bold text-gray-700">
                                {task.createdBy?.fullName}
                              </p>
                              {task.status === "completed" &&
                                task.completedBy && (
                                  <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                                    <span className="opacity-70">✓</span>
                                    {task.completedBy?.fullName}
                                  </p>
                                )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Popover
                            placement="bottom"
                            showArrow
                            offset={10}
                            onOpenChange={(open) => {
                              if (open) handleOpenPopover(task);
                            }}
                          >
                            <PopoverTrigger>
                              <div className="flex flex-wrap gap-1 max-w-[200px] cursor-pointer hover:bg-gray-100 p-1 rounded-lg transition-colors">
                                {Array.isArray(task.assignedTo) &&
                                task.assignedTo.length > 0 ? (
                                  task.assignedTo.map((user, idx) => (
                                    <Tooltip
                                      key={user._id || idx}
                                      content={user.fullName}
                                    >
                                      <Avatar
                                        src={user.avatar}
                                        name={user.fullName}
                                        size="sm"
                                        className="w-7 h-7 ring-2 ring-blue-500/30"
                                      />
                                    </Tooltip>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400 italic">
                                    {t("admin.tasks.unassigned")}
                                  </span>
                                )}
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[240px] p-0">
                              <div className="p-4 w-full">
                                <h4 className="text-sm font-bold mb-3 border-b pb-2">
                                  {t("admin.tasks.assignUsers")}
                                </h4>
                                <CheckboxGroup
                                  color="warning"
                                  value={tempAssignments[task._id] || []}
                                  onValueChange={(values) =>
                                    setTempAssignments((prev) => ({
                                      ...prev,
                                      [task._id]: values,
                                    }))
                                  }
                                  classNames={{
                                    wrapper: "gap-2",
                                  }}
                                >
                                  {defaultAssignedToUsers.map((user) => (
                                    <Checkbox key={user._id} value={user._id}>
                                      <div className="flex items-center gap-2">
                                        <Avatar
                                          src={user.avatar}
                                          size="xs"
                                          className="w-6 h-6"
                                        />
                                        <span className="text-xs">
                                          {user.fullName}
                                        </span>
                                      </div>
                                    </Checkbox>
                                  ))}
                                </CheckboxGroup>
                                <Button
                                  size="sm"
                                  color="primary"
                                  className="w-full mt-4 bg-gradient-to-r from-[#f48a42] to-[#f47242] text-white font-bold h-8"
                                  onPress={() =>
                                    handleAssignmentChange(
                                      task._id,
                                      tempAssignments[task._id],
                                    )
                                  }
                                >
                                  {t("admin.tasks.save")}
                                </Button>
                                <div className="mt-4 pt-2 border-t text-[10px] text-gray-400">
                                  * {t("admin.tasks.useModalForSearch")}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell className="w-1 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs text-gray-500">
                              {formatDate(task.createdAt)}
                            </p>
                            {task.status === "completed" &&
                              task.completedAt && (
                                <p className="text-xs text-green-700 font-black flex items-center gap-1">
                                  <span className="text-xs">✓</span>
                                  {formatDate(task.completedAt)}
                                </p>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {task.images?.length > 0 && (
                              <Tooltip
                                content={`${task.images.length} ${t(
                                  "admin.tasks.images",
                                )}`}
                              >
                                <div className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                                  <ImageIcon className="w-3 h-3" />
                                  {task.images.length}
                                </div>
                              </Tooltip>
                            )}
                            {task.links?.length > 0 && (
                              <Tooltip
                                content={`${task.links.length} ${t(
                                  "admin.tasks.links",
                                )}`}
                              >
                                <div className="flex items-center gap-1 bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
                                  <LinkIcon className="w-3 h-3" />
                                  {task.links.length}
                                </div>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Tooltip content={t("admin.tasks.edit")}>
                              <Button
                                size="sm"
                                isIconOnly
                                variant="flat"
                                color="primary"
                                aria-label={t("admin.tasks.edit")}
                                onPress={() => handleEditTask(task)}
                              >
                                <PencilIcon className="w-3 h-3" />
                              </Button>
                            </Tooltip>
                            <Tooltip content={t("admin.tasks.delete")}>
                              <Button
                                size="sm"
                                isIconOnly
                                variant="flat"
                                color="danger"
                                aria-label={t("admin.tasks.delete")}
                                onPress={() =>
                                  setModalData({
                                    isOpen: true,
                                    onClose: () =>
                                      setModalData({ isOpen: false }),
                                    onConfirm: () => handleDeleteTask(task._id),
                                    title: t("admin.tasks.confirmDelete"),
                                  })
                                }
                              >
                                <TrashIcon className="w-3 h-3" />
                              </Button>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center py-6 border-t border-gray-200 bg-gradient-to-r from-[#f48a42]/5 to-[#f47242]/5">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    showControls
                    showShadow
                    color="warning"
                    classNames={{
                      cursor: "bg-gradient-to-r from-[#f48a42] to-[#f47242]",
                      next: lang === "ar" ? "rotate-180" : "",
                      prev: lang === "ar" ? "rotate-180" : "",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Create Task Modal */}
      <TaskModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSubmit={handleCreateTask}
        isSubmitting={submitting}
        translate={translate}
        mode="create"
      />

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={isEditOpen}
        onClose={() => {
          onEditClose();
          setEditingTask(null);
        }}
        onSubmit={handleUpdateTask}
        isSubmitting={submitting}
        translate={translate}
        mode="edit"
        task={editingTask}
      />

      <ConfirmModal
        confirmText={t("admin.tasks.confirmDeleteBtn")}
        cancelText={t("admin.tasks.cancelDelete")}
        {...modalData}
      />

      {/* View Task Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => {
          onViewClose();
          setViewingTask(null);
        }}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {viewingTask && (
            <>
              <ModalHeader className="bg-gradient-to-r from-[#f48a42]/10 to-[#f47242]/10 border-b">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#f48a42] to-[#f47242] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {viewingTask.priority}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">
                      {viewingTask.title}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <Chip
                        size="sm"
                        color={getTypeInfo(viewingTask.type).color}
                      >
                        {t(`admin.tasks.types.${viewingTask.type}`) ||
                          getTypeInfo(viewingTask.type).label}
                      </Chip>
                      <Chip
                        size="sm"
                        color={getStatusInfo(viewingTask.status).color}
                      >
                        {t(`admin.tasks.statuses.${viewingTask.status}`) ||
                          getStatusInfo(viewingTask.status).label}
                      </Chip>
                    </div>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">
                      {t("admin.tasks.description")}
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
                      {viewingTask.description}
                    </p>
                  </div>

                  {/* Meta info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-[#f48a42]/10 to-[#f47242]/10 p-4 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">
                        {t("admin.tasks.createdBy")}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={viewingTask.createdBy?.avatar}
                          name={viewingTask.createdBy?.fullName}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium">
                            {viewingTask.createdBy?.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(viewingTask.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {viewingTask.completedBy && (
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-xl">
                        <h4 className="text-sm font-semibold text-gray-500 mb-2">
                          {t("admin.tasks.completedBy")}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={viewingTask.completedBy?.avatar}
                            name={viewingTask.completedBy?.fullName}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium">
                              {viewingTask.completedBy?.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(viewingTask.completedAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Images */}
                  {viewingTask.images?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-3">
                        {t("admin.tasks.images")} ({viewingTask.images.length})
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {viewingTask.images.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewImage(img.url)}
                            className="cursor-pointer block aspect-video bg-gray-100 rounded-xl overflow-hidden hover:opacity-80 transition-opacity shadow-md hover:shadow-lg"
                          >
                            <img
                              src={img.url}
                              alt={img.alt || `Image ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {viewingTask.links?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-3">
                        {t("admin.tasks.links")} ({viewingTask.links.length})
                      </h4>
                      <div className="space-y-2">
                        {viewingTask.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl text-purple-700 transition-colors"
                          >
                            <LinkIcon className="w-4 h-4" />
                            <span className="font-medium">
                              {link.title || link.url}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {viewingTask.notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">
                        {t("admin.tasks.notes")}
                      </h4>
                      <p className="text-gray-600 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                        {viewingTask.notes}
                      </p>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter className="border-t bg-gray-50">
                <Button
                  variant="flat"
                  onPress={() => {
                    onViewClose();
                    setViewingTask(null);
                  }}
                >
                  {t("admin.tasks.close")}
                </Button>
                <Button
                  color="primary"
                  className="bg-gradient-to-r from-[#f48a42] to-[#f47242]"
                  onPress={() => {
                    onViewClose();
                    handleEditTask(viewingTask);
                  }}
                >
                  {t("admin.tasks.edit")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        previewImage={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
};

export default TaskContainer;
