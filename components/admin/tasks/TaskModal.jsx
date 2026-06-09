"use client";
import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Textarea,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Listbox,
  ListboxItem,
  Chip,
  Spinner,
} from "@heroui/react";
import Button from "@/components/ui/Button";
import { Send } from "@/components/ui/svgs/icons/SendSvg";
import ImageUploader from "@/components/addProduct/ImageUploader";
import { useTranslations } from "@/hooks/useTranslations";

const taskTypes = [
  { key: "programming", label: "Programming" },
  { key: "bug", label: "Bug" },
  { key: "feature", label: "Feature" },
  { key: "seo", label: "SEO" },
  { key: "marketing", label: "Marketing" },
  { key: "ui", label: "UI" },
  { key: "ux", label: "UX" },
  { key: "design", label: "Design" },
  { key: "content", label: "Content" },
  { key: "testing", label: "Testing" },
  { key: "documentation", label: "Documentation" },
  { key: "other", label: "Other" },
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

const taskStatuses = [
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const TaskIcon = () => (
  <svg
    className="w-8 h-8 text-white"
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
);

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

function FormInput({ label, isRequired = false, ...props }) {
  return (
    <Input
      isRequired={isRequired}
      labelPlacement="outside-top"
      radius="sm"
      label={label}
      classNames={{
        base: "max-w-full !mt-0",
        input: "text-base",
        label: "text-sm font-medium text-darkNavy",
        inputWrapper:
          "border-2 border-gray-200 hover:border-[#f48a42] focus-within:!border-[#f48a42] bg-white",
      }}
      {...props}
    />
  );
}

const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  translate,
  mode = "create",
  task = null,
}) => {
  const t = useTranslations(translate);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "programming",
    status: "pending",
    priority: 0,
    notes: "",
    images: [],
    links: [],
    assignedTo: [],
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [newLink, setNewLink] = useState({ url: "", title: "" });
  const [userSearch, setUserSearch] = useState("");
  const [searchedUsers, setSearchedUsers] = useState(defaultAssignedToUsers);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (userSearch.length < 2) {
        setSearchedUsers(defaultAssignedToUsers);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/users?search=${userSearch}&accountType=admin&limit=10&client=true`,
        );
        const data = await response.json();
        if (data.success) {
          setSearchedUsers(data.data);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchUsers, 500);
    return () => clearTimeout(timer);
  }, [userSearch]);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && task) {
        setFormData({
          title: task.title || "",
          description: task.description || "",
          type: task.type || "programming",
          status: task.status || "pending",
          priority: task.priority || 0,
          notes: task.notes || "",
          images: task.images || [],
          links: task.links || [],
          assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : [],
        });
        // Convert existing images to ImageUploader format
        if (task.images?.length > 0) {
          setUploadedImages(
            task.images.map((img) => ({
              preview: img.url,
              name: img.alt || "image",
              type: "image/webp",
              gradientStyle: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
            })),
          );
        } else {
          setUploadedImages([]);
        }
      } else {
        setFormData({
          title: "",
          description: "",
          type: "programming",
          status: "pending",
          priority: 0,
          notes: "",
          images: [],
          links: [],
          assignedTo: [],
        });
        setUploadedImages([]);
      }
      setNewLink({ url: "", title: "" });
    }
  }, [isOpen, mode, task]);

  // Sync uploadedImages with formData.images
  useEffect(() => {
    const images = uploadedImages.map((img) => ({
      url: img.preview,
      alt: img.name || "task image",
    }));
    setFormData((prev) => ({ ...prev, images }));
  }, [uploadedImages]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const addLink = () => {
    if (newLink.url.trim()) {
      setFormData((prev) => ({
        ...prev,
        links: [...prev.links, { ...newLink }],
      }));
      setNewLink({ url: "", title: "" });
    }
  };

  const removeLink = (index) =>
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));

  const handleSubmit = async () => {
    if (formData.title.trim()) {
      const submitData = {
        ...formData,
        assignedTo: (Array.isArray(formData.assignedTo)
          ? formData.assignedTo
          : []
        ).map((u) => (typeof u === "string" ? u : u._id)),
      };
      await onSubmit(submitData);
    }
  };

  const handleSelectionChange = (keys) => {
    const selectedIds = Array.from(keys);
    // Combine searchedUsers and defaultAssignedToUsers to find the objects
    const allAvailableUsers = [...searchedUsers, ...defaultAssignedToUsers];
    const currentAssignedTo = Array.isArray(formData.assignedTo)
      ? formData.assignedTo
      : [];
    const selectedObjects = selectedIds
      .map((id) => {
        // Find if already in formData (to keep current object data)
        const existing = currentAssignedTo.find((u) => u._id === id);
        if (existing) return existing;
        // Search in all available
        return allAvailableUsers.find((u) => u._id === id);
      })
      .filter(Boolean);

    handleChange("assignedTo", selectedObjects);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        body: "py-4",
        backdrop: "bg-darkNavy/50 backdrop-blur-sm",
        base: "border-none bg-white dark:bg-gray-900 rounded-3xl",
        header: "border-b-[1.5px] border-gray-200 mx-8 p-8",
        footer: "pb-6",
        closeButton: "absolute top-9 left-8 text-3xl",
      }}
    >
      <ModalContent>
        <ModalHeader className="text-3xl font-semibold font-IBMPlex text-darkNavy flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-r from-[#f48a42] to-[#f47242] rounded-2xl flex items-center justify-center shadow-lg">
            <TaskIcon />
          </div>
          {mode === "create"
            ? t("admin.tasks.createTask")
            : t("admin.tasks.editTask")}
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* Title & Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <FormInput
                  label={t("admin.tasks.titleLabel")}
                  placeholder={t("admin.tasks.titlePlaceholder")}
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  isRequired
                />
              </div>
              <Select
                label={t("admin.tasks.type")}
                labelPlacement="outside"
                selectedKeys={[formData.type]}
                onChange={(e) => handleChange("type", e.target.value)}
                isRequired
                disallowEmptySelection
                classNames={{
                  base: "max-w-full !mt-0",
                  input: "text-base !rounded-md",
                  label: "mt-4 text-sm",
                }}
              >
                {taskTypes.map((type) => (
                  <SelectItem key={type.key} value={type.key}>
                    {t(`admin.tasks.types.${type.key}`) || type.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Priority, Due Date, Status Row */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
              <FormInput
                type="number"
                label={t("admin.tasks.priority")}
                value={formData.priority.toString()}
                onChange={(e) =>
                  handleChange("priority", parseInt(e.target.value) || 0)
                }
                min="0"
              />
              {mode === "edit" && (
                <Select
                  label={t("admin.tasks.status")}
                  labelPlacement="outside"
                  selectedKeys={[formData.status]}
                  onChange={(e) => handleChange("status", e.target.value)}
                  disallowEmptySelection
                  classNames={{
                    base: "max-w-full !mt-0",
                    input: "text-base !rounded-md",
                    label: "mt-4 text-sm",
                  }}
                >
                  {taskStatuses.map((status) => (
                    <SelectItem key={status.key} value={status.key}>
                      {t(`admin.tasks.statuses.${status.key}`) || status.label}
                    </SelectItem>
                  ))}
                </Select>
              )}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-darkNavy">
                  {t("admin.tasks.assignedTo")}
                </span>
                <Popover
                  placement="bottom"
                  showArrow
                  offset={10}
                  classNames={{ content: "p-0" }}
                  onOpenChange={(open) => {
                    if (!open) {
                      setUserSearch("");
                    }
                  }}
                >
                  <PopoverTrigger>
                    <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-200 hover:border-[#f48a42] rounded-xl transition-all min-h-12 bg-white cursor-pointer">
                      {Array.isArray(formData.assignedTo) &&
                      formData.assignedTo.length > 0 ? (
                        formData.assignedTo.map((user) => {
                          return (
                            <Chip
                              key={user._id}
                              variant="flat"
                              size="sm"
                              avatar={<Avatar src={user?.avatar} size="xs" />}
                              onClose={() => {
                                handleChange(
                                  "assignedTo",
                                  formData.assignedTo.filter(
                                    (u) => u._id !== user._id,
                                  ),
                                );
                              }}
                            >
                              {user?.fullName}
                            </Chip>
                          );
                        })
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {t("admin.tasks.selectUser")}
                        </span>
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px]">
                    <div className="flex flex-col w-full">
                      <div className="p-3 border-b sticky top-0 bg-white z-10">
                        <Input
                          size="sm"
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          startContent={<div className="text-gray-400">🔍</div>}
                          endContent={
                            isSearching && <Spinner size="sm" color="warning" />
                          }
                          isClearable
                          onClear={() => setUserSearch("")}
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto w-full">
                        <Listbox
                          aria-label="Assign users"
                          selectionMode="multiple"
                          selectedKeys={
                            new Set(
                              (Array.isArray(formData.assignedTo)
                                ? formData.assignedTo
                                : []
                              ).map((u) => u._id),
                            )
                          }
                          onSelectionChange={handleSelectionChange}
                          variant="flat"
                          disabledKeys={
                            new Set(
                              (Array.isArray(formData.assignedTo)
                                ? formData.assignedTo
                                : []
                              ).map((u) => u._id),
                            )
                          }
                          emptyContent={
                            isSearching
                              ? t("admin.tasks.searching") || "Searching..."
                              : t("admin.tasks.noUsersFound") ||
                                "No users found"
                          }
                        >
                          {searchedUsers.map((user) => (
                            <ListboxItem
                              key={user._id}
                              id={user._id}
                              textValue={user.fullName}
                              startContent={
                                <Avatar
                                  src={user.avatar}
                                  size="sm"
                                  className="w-8 h-8"
                                />
                              }
                            >
                              <div className="flex flex-col">
                                <span className="text-small font-medium">
                                  {user.fullName}
                                </span>
                              </div>
                            </ListboxItem>
                          ))}
                        </Listbox>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Separator */}
            <div className="h-[1.5px] w-full bg-black/10" />

            {/* Description */}
            <div className="flex flex-col gap-2">
              <span className="relative text-sm font-medium text-darkNavy w-fit">
                {t("admin.tasks.descriptionLabel")}
              </span>
              <Textarea
                placeholder={t("admin.tasks.descriptionPlaceholder")}
                aria-label={t("admin.tasks.descriptionLabel")}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                minRows={4}
                classNames={{
                  inputWrapper:
                    "border-2 border-gray-200 hover:border-[#f48a42] focus-within:!border-[#f48a42] bg-white",
                }}
              />
            </div>

            {/* Separator */}
            <div className="h-[1.5px] w-full bg-black/10" />

            {/* Images Section with ImageUploader */}
            <div className="flex flex-col gap-4">
              <span className="relative text-medium font-medium text-darkNavy w-fit">
                📷 {t("admin.tasks.images")}
              </span>
              <ImageUploader
                files={uploadedImages}
                setFiles={setUploadedImages}
                translate={translate}
                sm={true}
              />
            </div>

            {/* Separator */}
            <div className="h-[1.5px] w-full bg-black/10" />

            {/* Links Section */}
            <div className="flex flex-col gap-4">
              <span className="relative text-medium font-medium text-darkNavy w-fit">
                🔗 {t("admin.tasks.links")}
              </span>

              {formData.links.length > 0 && (
                <div className="space-y-2">
                  {formData.links.map((link, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl group border border-purple-100"
                    >
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                        <svg
                          className="w-4 h-4"
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
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-purple-900 truncate">
                          {link.title || "Untitled"}
                        </p>
                        <p className="text-xs text-purple-600 truncate">
                          {link.url}
                        </p>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        {t("admin.tasks.openLink")}
                      </a>
                      <button
                        onClick={() => removeLink(idx)}
                        aria-label={t("admin.tasks.deleteLink")}
                        className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  placeholder={t("admin.tasks.linkUrl")}
                  aria-label={t("admin.tasks.linkUrl")}
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink((p) => ({ ...p, url: e.target.value }))
                  }
                />
                <div className="flex gap-2">
                  <FormInput
                    placeholder={t("admin.tasks.linkTitle")}
                    aria-label={t("admin.tasks.linkTitle")}
                    value={newLink.title}
                    onChange={(e) =>
                      setNewLink((p) => ({ ...p, title: e.target.value }))
                    }
                    className="flex-1"
                  />
                  <Button
                    color="primary"
                    onPress={() => addLink()}
                    isDisabled={!newLink.url.trim()}
                    aria-label={t("admin.tasks.addLink")}
                    className="h-10 px-4"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="h-[1.5px] w-full bg-black/10" />

            {/* Notes Section */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-darkNavy">
                📝 {t("admin.tasks.notes")}
              </span>
              <Textarea
                placeholder={t("admin.tasks.notesPlaceholder")}
                aria-label={t("admin.tasks.notes")}
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                minRows={2}
                classNames={{
                  inputWrapper:
                    "border-2 border-yellow-200 hover:border-yellow-400 focus-within:!border-yellow-500 bg-[#FFFBEB]",
                }}
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex gap-4 justify-between border-t border-gray-200 pt-6">
          <Button
            onPress={() => handleSubmit()}
            isLoading={isSubmitting}
            isDisabled={!formData.title.trim()}
            size="xl"
            radius="full"
            className="text-[#F9FAFC] font-semibold font-IBMPlex text-lg flex items-center gap-2 px-9 py-6"
          >
            {mode === "create"
              ? t("admin.tasks.create")
              : t("admin.tasks.update")}
            <Send size={30} />
          </Button>
          <Button
            color="transparent text-darkNavy font-semibold text-xl"
            onPress={() => onClose()}
            isDisabled={isSubmitting}
          >
            {t("admin.tasks.cancel")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TaskModal;
