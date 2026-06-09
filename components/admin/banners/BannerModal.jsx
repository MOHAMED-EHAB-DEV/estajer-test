"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Switch,
  Select,
  SelectItem,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import Button from "@/components/ui/Button";
import { Send } from "@/components/ui/svgs/icons/SendSvg";
import ImageUploader from "@/components/addProduct/ImageUploader";

function FormInput({ ...props }) {
  return (
    <Input
      isRequired
      labelPlacement="outside-top"
      radius="sm"
      classNames={{
        base: "max-w-full !mt-0",
        input: "text-base",
        label: "text-sm",
      }}
      {...props}
    />
  );
}

export default function BannerModal({
  isOpen,
  onClose,
  t,
  translate,
  onSubmit,
  data,
  setData,
  images,
  setImages,
  imagesEn,
  setImagesEn,
  ModalIcon,
  isEditing = false,
  categories = [],
}) {
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(data.userId || "");
  const [selectedMainId, setSelectedMainId] = useState("");

  const fetchUsers = useCallback(async (search) => {
    if (!search || search.length < 2) return;
    setLoadingUsers(true);
    try {
      const res = await fetch(
        `/api/users?search=${search}&limit=10&client=true`,
      );
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearchTerm) {
        fetchUsers(userSearchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearchTerm, fetchUsers]);

  useEffect(() => {
    if (isOpen && data.userId && !selectedUser) {
      setSelectedUser(data.userId);
      // Optional: fetch specific user to show their name in Autocomplete
      const fetchSpecificUser = async () => {
        try {
          const res = await fetch(`/api/users/${data.userId}`);
          const resData = await res.json();
          if (resData.success) {
            setUsers([resData.data]);
            setUserSearchTerm(resData.data.fullName);
          }
        } catch (error) {
          console.error("Failed to fetch specific user:", error);
        }
      };
      fetchSpecificUser();
    }
  }, [isOpen, data.userId, selectedUser]);

  useEffect(() => {
    if (isOpen && data.categoryId && categories.length > 0) {
      const selected = categories.find((c) => c._id === data.categoryId);
      if (selected) {
        if (selected.parentCategory) {
          // It's a subcategory
          setSelectedMainId(
            typeof selected.parentCategory === "object"
              ? selected.parentCategory._id
              : selected.parentCategory,
          );
        } else {
          // It's a main category
          setSelectedMainId(selected._id);
        }
      }
    } else if (!isOpen) {
      setSelectedMainId("");
    }
  }, [isOpen, data.categoryId, categories]);

  const mainCategoriesList = categories.filter((c) => !c.parentCategory);
  const subCategoriesList = categories.filter((c) => {
    const parentId =
      typeof c.parentCategory === "object"
        ? c.parentCategory?._id
        : c.parentCategory;
    return parentId === selectedMainId;
  });

  const handleMainCategoryChange = (e) => {
    const val = e.target.value;
    setSelectedMainId(val);
    setData({ ...data, categoryId: val });
  };

  const handleSubCategoryChange = (e) => {
    const val = e.target.value;
    setData({ ...data, categoryId: val || selectedMainId });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = ({ target: { name, value } }) => {
    setData({ ...data, [name]: value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      placement="center"
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
          <ModalIcon />
          {isEditing ? t("editTitle") : t("addTitle")}
        </ModalHeader>
        <ModalBody className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label={t("altAr")}
              placeholder={t("altArPlaceholder")}
              name="altAr"
              onChange={(e) => setData({ ...data, altAr: e.target.value })}
              value={data.altAr || ""}
            />
            <FormInput
              label={t("altEn")}
              placeholder={t("altEnPlaceholder")}
              name="altEn"
              onChange={(e) => setData({ ...data, altEn: e.target.value })}
              value={data.altEn || ""}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label={t("link")}
              placeholder={t("linkPlaceholder")}
              name="link"
              onChange={(e) => setData({ ...data, link: e.target.value })}
              value={data.link || ""}
            />
            <FormInput
              label={t("order")}
              placeholder={t("orderPlaceholder")}
              name="order"
              type="number"
              onChange={(e) =>
                setData({ ...data, order: parseInt(e.target.value) })
              }
              value={data.order ?? 0}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label={t("place")}
              placeholder={t("placePlaceholder")}
              name="place"
              labelPlacement="outside"
              selectedKeys={[data.place || "home"]}
              onChange={handleChange}
              classNames={{
                base: "max-w-full",
                trigger: "bg-gray-100",
              }}
            >
              <SelectItem key="home" value="home">
                {t("home")}
              </SelectItem>
              <SelectItem key="category" value="category">
                {t("category")}
              </SelectItem>
              <SelectItem key="profile" value="profile">
                {t("profile")}
              </SelectItem>
            </Select>

            {data.place === "category" && (
              <>
                <Select
                  label={t("mainCategoryId")}
                  placeholder={t("mainCategoryPlaceholder")}
                  name="mainCategoryId"
                  labelPlacement="outside"
                  selectedKeys={selectedMainId ? [selectedMainId] : []}
                  onChange={handleMainCategoryChange}
                  classNames={{
                    base: "max-w-full",
                    trigger: "bg-gray-100",
                  }}
                >
                  {mainCategoriesList.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.nameAr}
                    </SelectItem>
                  ))}
                </Select>

                {selectedMainId && subCategoriesList.length > 0 && (
                  <Select
                    label={t("subCategoryId")}
                    placeholder={t("subCategoryPlaceholder")}
                    name="subCategoryId"
                    labelPlacement="outside"
                    selectedKeys={
                      data.categoryId && data.categoryId !== selectedMainId
                        ? [data.categoryId]
                        : []
                    }
                    onChange={handleSubCategoryChange}
                    classNames={{
                      base: "max-w-full",
                      trigger: "bg-gray-100",
                    }}
                  >
                    {subCategoriesList.map((sub) => (
                      <SelectItem key={sub._id} value={sub._id}>
                        {sub.nameAr}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              </>
            )}

            {data.place === "profile" && (
              <div className="flex flex-col gap-2">
                <Autocomplete
                  label={t("userSelection")}
                  placeholder={t("userPlaceholder")}
                  inputValue={userSearchTerm}
                  onInputChange={setUserSearchTerm}
                  selectedKey={data.userId || ""}
                  onSelectionChange={(key) =>
                    setData({ ...data, userId: key || "" })
                  }
                  isLoading={loadingUsers}
                  menuTrigger="input"
                  labelPlacement="outside"
                  classNames={{
                    base: "max-w-full",
                    trigger: "bg-gray-100",
                  }}
                >
                  {users.map((user) => (
                    <AutocompleteItem
                      key={user._id}
                      textValue={user.fullName}
                      value={user._id}
                    >
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
                    </AutocompleteItem>
                  ))}
                </Autocomplete>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Switch
              isSelected={data.active ?? true}
              onValueChange={(val) => setData({ ...data, active: val })}
              color="primary"
            />
            <span className="text-sm text-darkNavy font-medium">
              {t("active")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              isSelected={data.nana ?? false}
              onValueChange={(val) => setData({ ...data, nana: val })}
              color="primary"
            />
            <span className="text-sm text-darkNavy font-medium">
              {t("nana")}
            </span>
          </div>

          <div className="h-[1.5px] w-full bg-black/10" />
          <div className="flex justify-between gap-6">
            <div className="flex flex-col flex-1 gap-4">
              <span className="relative text-medium text-darkNavy w-fit">
                {t("image")}
                <span className="text-primary absolute -left-2 -top-1">*</span>
              </span>
              <ImageUploader
                files={images}
                setFiles={setImages}
                translate={translate}
                sm={true}
                isThumbnail={true}
              />
            </div>

            <div className="flex flex-col flex-1 gap-4">
              <span className="relative text-medium text-darkNavy w-fit">
                {t("imageEn")}
                <span className="text-primary absolute -left-2 -top-1">*</span>
              </span>
              <ImageUploader
                files={imagesEn}
                setFiles={setImagesEn}
                translate={translate}
                sm={true}
                isThumbnail={true}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex gap-4 justify-between">
          <Button
            onPress={handleSubmit}
            isLoading={loading}
            size="xl"
            radius="full"
            className="text-[#F9FAFC] font-semibold font-IBMPlex text-lg flex items-center gap-2 px-9 py-6"
          >
            {isEditing ? t("update") : t("add")}
            <Send size={30} />
          </Button>
          <Button
            color="transparent text-darkNavy font-semibold text-xl"
            onPress={onClose}
            isDisabled={loading}
          >
            {t("cancel")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
