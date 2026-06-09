"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
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
} from "@heroui/react";
import { useDebounce } from "use-debounce";
import { toast } from "@/utils/toast";
import ToastMessage from "@/components/ui/ToastMessage";
import revalidate from "@/actions/revalidateTag";
import { useTranslations } from "@/hooks/useTranslations";
// Using simple SVG icons instead of Heroicons
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

const SponsorContainer = ({ initialData, translate, categories, lang }) => {
  const t = useTranslations(translate);
  const router = useRouter();
  const [searchParams, setSearchParams] = useState("");

  // Get current search params using browser API
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearchParams(window.location.search);
    }
  }, []);

  const [sponsors, setSponsors] = useState(initialData.sponsors);
  const [totalSponsors, setTotalSponsors] = useState(initialData.totalSponsors);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedUser, setSelectedUser] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priority, setPriority] = useState(0);
  const [sponsorshipEndDate, setSponsorshipEndDate] = useState("");

  // User search states
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);

  // Edit modal states
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingSponsor, setEditingSponsor] = useState(null);

  const [debouncedUserSearch] = useDebounce(userSearchTerm, 700);

  // Use categories from props (passed from static/categories.js)
  const categoryOptions = categories.map((category) => ({
    key: category.key,
    label: category.name,
  }));

  useEffect(() => {
    setSponsors(initialData.sponsors);
    setTotalSponsors(initialData.totalSponsors);
    setTotalPages(initialData.totalPages);
    setCurrentPage(initialData.currentPage);
  }, [initialData]);

  // Search users
  useEffect(() => {
    if (!autocompleteOpen) return;
    if (!debouncedUserSearch) return setUsers([]);

    const searchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch(
          `/api/users?search=${encodeURIComponent(
            debouncedUserSearch,
          )}&limit=10&client=true`,
        );
        const data = await response.json();
        if (data.success) setUsers(data.data);
      } catch (error) {
        console.error("Error searching users:", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    searchUsers();
  }, [debouncedUserSearch, autocompleteOpen]);

  const handleUserSelect = (userId) => {
    if (userId) {
      const selectedUserData = users.find((user) => user._id === userId);
      if (selectedUserData) {
        setSelectedUser(userId);
        setUserSearchTerm(selectedUserData.fullName);
      }
    } else {
      setSelectedUser("");
      setUserSearchTerm("");
    }
  };

  const resetForm = () => {
    setSelectedUser("");
    setUserSearchTerm("");
    setSelectedCategory("");
    setPriority(0);
    setSponsorshipEndDate("");
  };

  const handleCreateSponsor = async () => {
    if (!selectedUser || !selectedCategory) {
      toast.error(ToastMessage(t("admin.sponsors.errors.selectUserCategory")));
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser,
          category: selectedCategory,
          priority: parseInt(priority),
          sponsorshipEndDate: sponsorshipEndDate || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(ToastMessage(t("admin.sponsors.success.created")));
        resetForm();
        refreshData();
        revalidate("/");
      } else {
        toast.error(
          ToastMessage(data.error || t("admin.sponsors.errors.createFailed")),
        );
      }
    } catch (error) {
      console.error("Error creating sponsor:", error);
      toast.error(ToastMessage(t("admin.sponsors.errors.createFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSponsor = (sponsor) => {
    setEditingSponsor(sponsor);
    onOpen();
  };

  const handleUpdateSponsor = async () => {
    if (!editingSponsor) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/sponsors/${editingSponsor._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: editingSponsor.category,
          isActive: editingSponsor.isActive,
          priority: parseInt(editingSponsor.priority),
          sponsorshipEndDate: editingSponsor.sponsorshipEndDate || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(ToastMessage(t("admin.sponsors.success.updated")));
        onClose();
        refreshData();
        revalidate("/");
      } else {
        toast.error(
          ToastMessage(data.error || t("admin.sponsors.errors.updateFailed")),
        );
      }
    } catch (error) {
      console.error("Error updating sponsor:", error);
      toast.error(ToastMessage(t("admin.sponsors.errors.updateFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSponsor = async (sponsorId) => {
    if (!confirm(t("admin.sponsors.confirmDelete"))) return;

    try {
      const response = await fetch(`/api/sponsors/${sponsorId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success(ToastMessage(t("admin.sponsors.success.deleted")));
        refreshData();
      } else {
        toast.error(
          ToastMessage(data.error || t("admin.sponsors.errors.deleteFailed")),
        );
      }
    } catch (error) {
      console.error("Error removing sponsor:", error);
      toast.error(ToastMessage(t("admin.sponsors.errors.deleteFailed")));
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      params.set("lang", lang);
      const response = await fetch(`/api/sponsors?${params}`);
      const data = await response.json();

      if (data.success) {
        setSponsors(data.data);
        setTotalSponsors(data.pagination?.total || 0);
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
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* Add New Sponsor Form */}
      <Card className="border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <PlusIcon className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t("admin.sponsors.addNew")}
            </h2>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Autocomplete
              label={t("admin.sponsors.selectUser")}
              placeholder={t("admin.sponsors.searchUser")}
              inputValue={userSearchTerm}
              onInputChange={setUserSearchTerm}
              selectedKey={selectedUser}
              onSelectionChange={handleUserSelect}
              onOpenChange={setAutocompleteOpen}
              isLoading={loadingUsers}
              allowsCustomValue={false}
              menuTrigger="input"
              items={users}
              clearButtonProps={{
                onPress: () => {
                  setUserSearchTerm("");
                  setSelectedUser("");
                },
              }}
              classNames={{
                base: "w-full",
                listboxWrapper: "max-h-[200px]",
              }}
            >
              {(user) => (
                <AutocompleteItem
                  textValue={user.fullName}
                  key={user._id}
                  value={user._id}
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar} name={user.fullName} size="sm" />
                    <div className="flex flex-col">
                      <span className="font-medium">{user.fullName}</span>
                      <span className="text-sm text-gray-500">
                        {user.email}
                      </span>
                      {user.phone && (
                        <span className="text-xs text-gray-400">
                          {user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>

            <Select
              label={t("admin.sponsors.selectCategory")}
              // placeholder={t("admin.sponsors.category.placeholder")}
              selectedKeys={selectedCategory ? [selectedCategory] : []}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categoryOptions.map((category) => (
                <SelectItem key={category.key} value={category.key}>
                  {category.label}
                </SelectItem>
              ))}
            </Select>

            <Input
              type="number"
              label={t("admin.sponsors.priority")}
              placeholder="0"
              value={priority.toString()}
              onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
              description={t("admin.sponsors.priorityDesc")}
            />

            <Input
              type="date"
              label={t("admin.sponsors.endDate")}
              value={sponsorshipEndDate}
              onChange={(e) => setSponsorshipEndDate(e.target.value)}
              description={t("admin.sponsors.endDateDesc")}
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button
              color="primary"
              onPress={handleCreateSponsor}
              isLoading={submitting}
              disabled={!selectedUser || !selectedCategory}
              startContent={<PlusIcon className="w-4 h-4" />}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium"
            >
              {t("admin.sponsors.addSponsor")}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Sponsors Table */}
      <Card className="">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("admin.sponsors.currentSponsors")}
            </h2>
            <div className="text-sm text-gray-600">
              {t("admin.sponsors.totalCount")}: {totalSponsors}
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" color="primary" />
            </div>
          ) : (
            <>
              <Table
                aria-label="Sponsors table"
                shadow="none"
                className="min-h-[400px]"
              >
                <TableHeader>
                  <TableColumn>{t("admin.sponsors.user")}</TableColumn>
                  <TableColumn>
                    {t("admin.sponsors.category.label")}
                  </TableColumn>
                  <TableColumn>{t("admin.sponsors.status.label")}</TableColumn>
                  <TableColumn>{t("admin.sponsors.priority")}</TableColumn>
                  <TableColumn>
                    {t("admin.sponsors.stats.requests")}
                  </TableColumn>
                  <TableColumn>
                    {t("admin.sponsors.table.startDate")}
                  </TableColumn>
                  <TableColumn>{t("admin.sponsors.table.endDate")}</TableColumn>
                  <TableColumn>{t("admin.sponsors.actions")}</TableColumn>
                </TableHeader>
                <TableBody>
                  {sponsors.map((sponsor) => (
                    <TableRow key={sponsor._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={sponsor.user?.avatar}
                            name={sponsor.user?.name}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium">{sponsor.user?.name}</p>
                            <p className="text-sm text-gray-500">
                              {sponsor.user?.email}
                            </p>
                            {sponsor.user?.shopName && (
                              <p className="text-xs text-blue-600">
                                {sponsor.user?.shopName}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="secondary">
                          {categoryOptions.find(
                            (c) => c.key === sponsor.category,
                          )?.label || sponsor.category}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="sm"
                          color={sponsor.isActive ? "success" : "danger"}
                          variant="flat"
                        >
                          {sponsor.isActive
                            ? t("admin.sponsors.status.active")
                            : t("admin.sponsors.status.inactive")}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="primary">
                          {sponsor.priority}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="text-xs text-gray-600">
                            {t("admin.sponsors.stats.products")}:{" "}
                            {sponsor.productsCount || 0}
                          </div>
                          <div className="text-xs text-gray-600">
                            {t("admin.sponsors.stats.requests")}:{" "}
                            {sponsor.productRequestsCount || 0}
                          </div>
                          <div className="text-xs text-gray-600">
                            {t("admin.sponsors.stats.orders")}:{" "}
                            {sponsor.ordersCount || 0}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(
                            sponsor.sponsorshipStartDate,
                          ).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {sponsor.sponsorshipEndDate
                            ? new Date(
                                sponsor.sponsorshipEndDate,
                              ).toLocaleDateString()
                            : t("admin.sponsors.indefinite")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="flat"
                            color="primary"
                            onPress={() => handleEditSponsor(sponsor)}
                            startContent={<PencilIcon className="w-3 h-3" />}
                          >
                            {t("admin.sponsors.edit")}
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleDeleteSponsor(sponsor._id)}
                            startContent={<TrashIcon className="w-3 h-3" />}
                          >
                            {t("admin.sponsors.remove")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center py-6 border-t border-gray-200">
                  <Pagination
                    total={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    showControls
                    showShadow
                    color="primary"
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {t("admin.sponsors.editSponsor")}
          </ModalHeader>
          <ModalBody>
            {editingSponsor && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Avatar
                    src={editingSponsor.user?.avatar}
                    name={editingSponsor.user?.name}
                    size="md"
                  />
                  <div>
                    <p className="font-medium">{editingSponsor.user?.name}</p>
                    <p className="text-sm text-gray-500">
                      {editingSponsor.user?.email}
                    </p>
                  </div>
                </div>

                <Select
                  label={t("admin.sponsors.category.label")}
                  selectedKeys={[editingSponsor.category]}
                  onChange={(e) =>
                    setEditingSponsor({
                      ...editingSponsor,
                      category: e.target.value,
                    })
                  }
                >
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.key} value={category.key}>
                      {category.label}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label={t("admin.sponsors.status.label")}
                  selectedKeys={[editingSponsor.isActive.toString()]}
                  onChange={(e) =>
                    setEditingSponsor({
                      ...editingSponsor,
                      isActive: e.target.value === "true",
                    })
                  }
                >
                  <SelectItem key="true" value="true">
                    {t("admin.sponsors.status.active")}
                  </SelectItem>
                  <SelectItem key="false" value="false">
                    {t("admin.sponsors.status.inactive")}
                  </SelectItem>
                </Select>

                <Input
                  type="number"
                  label={t("admin.sponsors.priority")}
                  value={editingSponsor.priority?.toString() || "0"}
                  onChange={(e) =>
                    setEditingSponsor({
                      ...editingSponsor,
                      priority: parseInt(e.target.value) || 0,
                    })
                  }
                />

                <Input
                  type="date"
                  label={t("admin.sponsors.endDate")}
                  value={
                    editingSponsor.sponsorshipEndDate
                      ? new Date(editingSponsor.sponsorshipEndDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setEditingSponsor({
                      ...editingSponsor,
                      sponsorshipEndDate: e.target.value || null,
                    })
                  }
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              {t("admin.sponsors.cancel")}
            </Button>
            <Button
              color="primary"
              onPress={handleUpdateSponsor}
              isLoading={submitting}
            >
              {t("admin.sponsors.updateSponsor")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SponsorContainer;
