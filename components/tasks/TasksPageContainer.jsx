"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  Chip,
  Avatar,
  Pagination,
  Input,
  Select,
  SelectItem,
  Button,
  useDisclosure,
} from "@heroui/react";
import CustomModal from "../ui/CustomModal";
import { useTranslations } from "@/hooks/useTranslations";

const taskTypes = [
  { key: "all", label: "All", color: "default" },
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

const taskStatuses = [
  { key: "pending", label: "Pending", color: "warning" },
  { key: "in_progress", label: "In Progress", color: "primary" },
  { key: "completed", label: "Completed", color: "success" },
  { key: "cancelled", label: "Cancelled", color: "danger" },
];

const SearchIcon = ({ className }) => (
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
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
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

const CalendarIcon = ({ className }) => (
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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const TasksPageContainer = ({ data, translate, lang, queryParams }) => {
  const t = useTranslations(translate);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState(null);

  const [search, setSearch] = useState(queryParams?.search || "");
  const [type, setType] = useState(queryParams?.type || "all");
  const [showCompleted, setShowCompleted] = useState(
    queryParams?.showCompleted === "true",
  );

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type && type !== "all") params.set("type", type);
    if (showCompleted) params.set("showCompleted", "true");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const getTypeInfo = (typeKey) =>
    taskTypes.find((t) => t.key === typeKey) || taskTypes[0];
  const getStatusInfo = (status) =>
    taskStatuses.find((s) => s.key === status) || taskStatuses[0];

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleViewTask = (task) => {
    setSelectedTask(task);
    onOpen();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#f48a42] to-[#f47242] rounded-3xl shadow-2xl mb-6">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-[#f48a42] to-[#f47242] bg-clip-text text-transparent">
          {t("tasks.page.title")}
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          {t("tasks.page.subtitle")}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8 shadow-xl border-0 bg-gradient-to-r from-white to-[#f48a42]/5">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <Input
              placeholder={t("tasks.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              startContent={<SearchIcon className="w-4 h-4 text-gray-400" />}
              className="flex-1"
              classNames={{
                inputWrapper:
                  "bg-white border-2 border-transparent focus-within:border-[#f48a42] shadow-md",
              }}
            />
            <Select
              label={t("tasks.type")}
              aria-label={t("tasks.type")}
              selectedKeys={[type]}
              onChange={(e) => setType(e.target.value)}
              className="w-full md:w-48"
              classNames={{ trigger: "bg-white shadow-md" }}
            >
              {taskTypes.map((t) => (
                <SelectItem key={t.key} value={t.key}>
                  {t.label}
                </SelectItem>
              ))}
            </Select>
            <Button
              variant={showCompleted ? "solid" : "flat"}
              onPress={() => setShowCompleted(!showCompleted)}
              className={
                showCompleted
                  ? "bg-gradient-to-r from-[#f48a42] to-[#f47242] text-white"
                  : "bg-white shadow-md"
              }
            >
              {t("tasks.showCompleted")}
            </Button>
            <Button
              onPress={handleFilter}
              className="bg-gradient-to-r from-[#f48a42] to-[#f47242] text-white shadow-lg px-8"
            >
              {t("tasks.filter")}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          {t("tasks.totalCount")}:{" "}
          <span className="font-bold text-[#f48a42]">{data.totalTasks}</span>{" "}
          {t("tasks.tasks")}
        </p>
      </div>

      {/* Tasks Grid */}
      {data.tasks.length === 0 ? (
        <Card className="shadow-xl">
          <CardBody className="py-20 text-center">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#f48a42]/20 to-[#f47242]/20 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-[#f48a42]"
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
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {t("tasks.noTasks")}
            </h3>
            <p className="text-gray-500">{t("tasks.noTasksDesc")}</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.tasks.map((task, index) => {
            const typeInfo = getTypeInfo(task.type);
            const statusInfo = getStatusInfo(task.status);

            return (
              <Card
                key={task._id}
                className="shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
                isPressable
                onPress={() => handleViewTask(task)}
                aria-label={`${t("tasks.viewTask")}: ${task.title}`}
              >
                {/* Priority Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#f48a42] to-[#f47242] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                    {task.priority}
                  </div>
                </div>

                {/* Colored top border based on type */}
                <div
                  className={`h-1 bg-gradient-to-r ${
                    task.type === "bug"
                      ? "from-red-400 to-red-600"
                      : task.type === "feature"
                        ? "from-green-400 to-green-600"
                        : task.type === "programming"
                          ? "from-blue-400 to-blue-600"
                          : "from-[#f48a42] to-[#f47242]"
                  }`}
                />

                <CardBody className="p-6">
                  {/* Title & Description */}
                  <div className="pe-14 mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#f48a42] transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-3">
                      {task.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Chip
                      size="sm"
                      color={typeInfo.color}
                      variant="flat"
                      className="capitalize"
                    >
                      {t(`tasks.types.${task.type}`)}
                    </Chip>
                    <Chip size="sm" color={statusInfo.color} variant="dot">
                      {t(`tasks.statuses.${task.status}`)}
                    </Chip>
                  </div>

                  {/* Attachments */}
                  {(task.images?.length > 0 || task.links?.length > 0) && (
                    <div className="flex gap-3 mb-4">
                      {task.images?.length > 0 && (
                        <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                          <ImageIcon className="w-3 h-3" />
                          {task.images.length}
                        </div>
                      )}
                      {task.links?.length > 0 && (
                        <div className="flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                          <LinkIcon className="w-3 h-3" />
                          {task.links.length}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={task.createdBy?.avatar}
                        name={task.createdBy?.fullName}
                        size="sm"
                        className="ring-2 ring-[#f48a42]/30"
                      />
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          {task.createdBy?.fullName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(task.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Completed By */}
                  {task.status === "completed" && task.completedBy && (
                    <div className="mt-3 pt-3 border-t border-green-100 bg-green-50 -mx-6 -mb-6 px-6 py-3">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <Avatar
                          src={task.completedBy?.avatar}
                          name={task.completedBy?.fullName}
                          size="sm"
                        />
                        <span className="text-xs text-green-700 font-medium">
                          {task.completedBy?.fullName}
                        </span>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <Pagination
            total={data.totalPages}
            page={data.currentPage}
            onChange={handlePageChange}
            showControls
            showShadow
            color="warning"
            classNames={{
              cursor: "bg-gradient-to-r from-[#f48a42] to-[#f47242]",
            }}
          />
        </div>
      )}

      {/* Task Detail Modal */}
      <CustomModal
        isOpen={isOpen}
        onClose={onClose}
        size="4xl"
        className="bg-white dark:bg-gray-900 text-black dark:text-white rounded-2xl max-h-[90vh] overflow-hidden flex flex-col"
        backdropClass="bg-black/50 backdrop-blur-sm"
      >
        {selectedTask && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#f48a42]/10 to-[#f47242]/10 border-b border-gray-200 dark:border-gray-800 p-4 md:p-6 flex items-center gap-3 flex-shrink-0 relative">
              <div className="w-12 h-12 bg-gradient-to-r from-[#f48a42] to-[#f47242] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                {selectedTask.priority}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {selectedTask.title}
                </h3>
                <div className="flex gap-2 mt-1">
                  <Chip
                    size="sm"
                    color={getTypeInfo(selectedTask.type).color}
                  >
                    {selectedTask.type}
                  </Chip>
                  <Chip
                    size="sm"
                    color={getStatusInfo(selectedTask.status).color}
                  >
                    {selectedTask.status}
                  </Chip>
                </div>
              </div>
              {/* Close Button */}
              <button
                onClick={onClose}
                type="button"
                className="absolute top-4 end-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-2">
                  {t("tasks.description")}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                  {selectedTask.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#f48a42]/10 to-[#f47242]/10 p-4 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    {t("tasks.createdBy")}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={selectedTask.createdBy?.avatar}
                      name={selectedTask.createdBy?.fullName}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium">
                        {selectedTask.createdBy?.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(selectedTask.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedTask.completedBy && (
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 p-4 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">
                      {t("tasks.completedBy")}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={selectedTask.completedBy?.avatar}
                        name={selectedTask.completedBy?.fullName}
                        size="sm"
                      />
                      <div>
                        <p className="font-medium">
                          {selectedTask.completedBy?.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedTask.completedAt &&
                            formatDate(selectedTask.completedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {selectedTask.images?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">
                    {t("tasks.images")}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedTask.images.map((img, idx) => (
                      <a
                        key={idx}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden hover:opacity-80 transition-opacity shadow-md"
                      >
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {selectedTask.links?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">
                    {t("tasks.links")}
                  </h4>
                  <div className="space-y-2">
                    {selectedTask.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl text-purple-700 dark:text-purple-400 transition-colors"
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
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 flex justify-end flex-shrink-0">
              <Button variant="flat" onPress={onClose}>
                {t("tasks.close")}
              </Button>
            </div>
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default TasksPageContainer;
