"use client";
import { useState, useCallback, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
} from "@heroui/react";
import Button from "../ui/Button";
import { Input, Select, SelectItem, Label, Switch } from "@heroui/react";
import { Send } from "../ui/svgs/icons/SendSvg";
import ImageUploader from "../addProduct/ImageUploader";
import dynamic from "next/dynamic";
import { toast } from "@/utils/toast";

const ReactQuill = dynamic(
  async () => {
    await import("react-quill-new/dist/quill.snow.css");
    const { default: RQ, Quill } = await import("react-quill-new");

    // Custom Link format
    const Link = Quill.import("formats/link");
    class CustomLink extends Link {
      static create(value) {
        const node = super.create(value);
        node.setAttribute("class", "text-primary underline");
        return node;
      }
    }
    Quill.register(CustomLink, true);

    // Custom Header format
    const Header = Quill.import("formats/header");
    class CustomHeader extends Header {
      static create(value) {
        const node = super.create(value);
        const classes = {
          2: "text-3xl font-bold mb-4 text-darkNavy",
          3: "text-2xl font-bold mb-3 text-darkNavy",
          4: "text-xl font-bold mb-2 text-darkNavy",
          5: "text-lg font-bold mb-1 text-darkNavy",
          6: "text-base font-bold text-darkNavy",
        };
        if (classes[value]) {
          node.setAttribute("class", classes[value]);
        }
        return node;
      }
    }
    Quill.register(CustomHeader, true);

    // Custom Block (Paragraph) format for "Normal" text
    const Block = Quill.import("blots/block");
    class CustomBlock extends Block {
      static create(value) {
        const node = super.create(value);
        node.setAttribute("class", "text-base text-gray-700 leading-relaxed");
        return node;
      }
    }
    Quill.register(CustomBlock, true);

    // Custom Image format to support alt text
    const Image = Quill.import("formats/image");
    class CustomImage extends Image {
      static create(value) {
        const node = super.create(value);
        if (typeof value === "object") {
          node.setAttribute("src", value.url);
          if (value.alt) {
            node.setAttribute("alt", value.alt);
            node.setAttribute("title", value.alt);
          }
        } else node.setAttribute("src", value);
        return node;
      }

      static value(node) {
        return {
          url: node.getAttribute("src"),
          alt: node.getAttribute("alt"),
          title: node.getAttribute("title"),
        };
      }
    }
    Quill.register(CustomImage, true);

    return RQ;
  },
  { ssr: false },
);

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "indent",
  "link",
  "image",
  "color",
  "background",
  "font",
  "size",
  "align",
  "direction",
  "script",
  "code",
  "code-block",
  "video",
];

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

export default function AddModal({
  isOpen,
  onClose,
  t,
  translate,
  onSubmit,
  data,
  setData,
  images,
  setImages,
  ModalIcon,
  modalKey,
  mainCategories = [],
  isEditing = false,
}) {
  const [loading, setLoading] = useState(false);

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const MAX_WIDTH = 1500;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          const resizedBase64 = canvas.toDataURL("image/webp");
          resolve(resizedBase64);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const imageHandler = useCallback(function () {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const quill = this.quill;
        const loadingToast = await toast.loading("Processing image...");
        try {
          const resizedBase64 = await resizeImage(file);

          const byteString = atob(resizedBase64.split(",")[1]);
          const mimeString = resizedBase64
            .split(",")[0]
            .split(":")[1]
            .split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });

          const body = new FormData();
          body.append("file", blob, file.name);
          const res = await fetch("/api/upload", { method: "POST", body });
          const data = await res.json();
          toast.dismiss(loadingToast);
          if (data.success) {
            const altText = prompt("Enter alt text for the image (optional):");
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, "image", {
              url: data.url,
              alt: altText || "",
              title: altText || "",
            });

            toast.success("Image inserted successfully");
          } else {
            toast.error("Image upload failed");
          }
        } catch (err) {
          toast.dismiss(loadingToast);
          toast.error("Error processing image");
          console.error(err);
        }
      }
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "image"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
    }),
    [imageHandler],
  );

  const handleChange = ({ target: { type, name, value } }) =>
    setData({
      ...data,
      [name]: type === "number" ? +value : value,
    });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  };

  const gridSwitch = () => {
    switch (modalKey) {
      case "categories":
        return "grid-rows-3 md:grid-rows-1 md:grid-cols-3";
      default:
        return "grid-rows-2 md:grid-rows-1 md:grid-cols-2";
    }
  };

  // Check if adding/editing a subcategory (image not required)
  const isSubcategory = data.categoryType && data.categoryType !== "main";

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
          {isEditing ? t("editTitle") : t("title")}
        </ModalHeader>
        <ModalBody className="max-h-[70vh] overflow-auto">
          <div className={`grid ${gridSwitch()} gap-6`}>
            <FormInput
              label={t("titleAr")}
              name="nameAr"
              placeholder={t("titleAr")}
              onChange={(e) => setData({ ...data, nameAr: e.target.value })}
              value={data.nameAr || data.titleAr || ""}
              type="text"
            />
            <FormInput
              label={t("titleEn")}
              placeholder={t("titleEn")}
              name="nameEn"
              onChange={(e) => setData({ ...data, nameEn: e.target.value })}
              value={data.nameEn || data.titleEn || ""}
              type="text"
            />
            {modalKey === "categories" && (
              <Select
                classNames={{
                  base: "max-w-full !mt-0",
                  input: "text-base !rounded-md",
                  label: "mt-4 text-sm",
                }}
                labelPlacement="outside"
                defaultSelectedKeys={[data.status]}
                selectedKeys={[data.status || "active"]}
                label={t("status")}
                name="status"
                onChange={handleChange}
                value={data.status}
                isRequired
                disallowEmptySelection
                selectionMode="single"
              >
                <SelectItem key="active" value="active">
                  {t("active")}
                </SelectItem>
                <SelectItem key="inactive" value="inactive">
                  {t("inactive")}
                </SelectItem>
              </Select>
            )}
          </div>
          {modalKey === "categories" && (
            <>
              <div className="h-[1.5px] w-full bg-black/10" />
              <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-6">
                <FormInput
                  label={t("key")}
                  name="key"
                  onChange={handleChange}
                  value={data.key}
                  type="text"
                  placeholder={t("keyDescription")}
                />
                <Select
                  classNames={{
                    base: "max-w-full !mt-0",
                    input: "text-base !rounded-md",
                    label: "mt-4 text-sm",
                  }}
                  labelPlacement="outside"
                  label={t("categoryType")}
                  name="categoryType"
                  onChange={handleChange}
                  value={data.categoryType}
                  isRequired
                  disallowEmptySelection
                  selectedKeys={[data.categoryType || "main"]}
                  selectionMode="single"
                >
                  <SelectItem
                    key="main"
                    value="main"
                    textValue={t("mainCategory")}
                  >
                    {t("mainCategory")}
                  </SelectItem>
                  {mainCategories.map((cat) => (
                    <SelectItem
                      key={cat._id}
                      value={cat._id}
                      textValue={`${cat.nameAr} - ${cat.nameEn}`}
                    >
                      {cat.nameAr} - {cat.nameEn}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="grid grid-rows-1 md:grid-cols-2 gap-6">
                <FormInput
                  label={t("order")}
                  name="order"
                  onChange={handleChange}
                  value={data.order ?? 0}
                  type="number"
                  placeholder={t("orderDescription")}
                  isRequired={false}
                />
                <div className="flex flex-col mt-6 gap-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      isSelected={data.nana || false}
                      onValueChange={(isSelected) =>
                        setData({ ...data, nana: isSelected })
                      }
                      size="sm"
                      color="primary"
                    />
                    <span className="text-sm text-darkNavy">
                      {t("addToNana")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      isSelected={data.hideFromHome || false}
                      onValueChange={(isSelected) =>
                        setData({ ...data, hideFromHome: isSelected })
                      }
                      size="sm"
                      color="primary"
                    />
                    <span className="text-sm text-darkNavy">
                      {t("hideFromHome")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-px w-full bg-black/10" />
              <div className="flex flex-col gap-4">
                <span className="text-lg font-semibold text-darkNavy">
                  {t("seoData")}
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label={t("seoTitleAr")}
                    name="seoTitleAr"
                    onChange={handleChange}
                    value={data.seoTitleAr || ""}
                    type="text"
                    isRequired={false}
                  />
                  <FormInput
                    label={t("seoTitleEn")}
                    name="seoTitleEn"
                    onChange={handleChange}
                    value={data.seoTitleEn || ""}
                    type="text"
                    isRequired={false}
                  />
                  {/* use Textare instead of form input */}
                  <Textarea
                    label={t("seoDescriptionAr")}
                    name="seoDescriptionAr"
                    onChange={handleChange}
                    value={data.seoDescriptionAr || ""}
                    type="text"
                    isRequired={false}
                    minRows={2}
                    labelPlacement="outside"
                    classNames={{
                      input: "resize-y text-base text-right",
                      label: "text-sm pb-3 flex items-center",
                    }}
                  />
                  <Textarea
                    label={t("seoDescriptionEn")}
                    name="seoDescriptionEn"
                    onChange={handleChange}
                    value={data.seoDescriptionEn || ""}
                    type="text"
                    isRequired={false}
                    minRows={2}
                    labelPlacement="outside"
                    classNames={{
                      input: "resize-y text-base text-right",
                      label: "text-sm pb-3 flex items-center",
                    }}
                  />
                  <FormInput
                    label={t("seoKeywordsAr")}
                    name="seoKeywordsAr"
                    onChange={handleChange}
                    value={data.seoKeywordsAr || ""}
                    type="text"
                    isRequired={false}
                  />
                  <FormInput
                    label={t("seoKeywordsEn")}
                    name="seoKeywordsEn"
                    onChange={handleChange}
                    value={data.seoKeywordsEn || ""}
                    type="text"
                    isRequired={false}
                  />
                </div>
                {/* Rich Content Section */}
                <div className="flex flex-col gap-4">
                  <span className="text-lg font-semibold text-darkNavy">
                    {t("richContent")}
                  </span>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm pb-1 flex items-center text-darkNavy">
                        {t("richContentAr")}
                      </label>
                      <ReactQuill
                        theme="snow"
                        value={data.richContentAr || ""}
                        onChange={(content) =>
                          setData((prev) => ({
                            ...prev,
                            richContentAr: content,
                          }))
                        }
                        placeholder={t("richContentArPlaceholder")}
                        modules={modules}
                        formats={formats}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm pb-1 flex items-center text-darkNavy">
                        {t("richContentEn")}
                      </label>
                      <ReactQuill
                        theme="snow"
                        value={data.richContentEn || ""}
                        onChange={(content) =>
                          setData((prev) => ({
                            ...prev,
                            richContentEn: content,
                          }))
                        }
                        placeholder={t("richContentEnPlaceholder")}
                        modules={modules}
                        formats={formats}
                        className="editorEn"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="h-[1.5px] w-full bg-black/10" />
          {modalKey === "categories" ? (
            <div className="flex flex-col gap-4">
              <span className="relative text-medium text-darkNavy w-fit">
                {t("image")}
                {!isSubcategory && (
                  <span className="text-primary absolute -left-2 -top-1">
                    *
                  </span>
                )}
              </span>
              {isSubcategory && (
                <p className="text-sm text-gray-500 -mt-2">
                  {t("imageOptional")}
                </p>
              )}
              <ImageUploader
                files={images}
                setFiles={setImages}
                translate={translate}
                sm={true}
                isThumbnail={true}
              />
            </div>
          ) : (
            <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-6">
              <Select
                classNames={{
                  base: "max-w-full !mt-0",
                  input: "text-base !rounded-md",
                  label: "mt-4 text-sm",
                }}
                labelPlacement="outside"
                defaultSelectedKeys={["all"]}
                label={t("usersType")}
                name="usersType"
                onChange={handleChange}
                value={data.usersType}
                isRequired
                disallowEmptySelection
                selectionMode="single"
              >
                <SelectItem key="all" value="all">
                  {t("all")}
                </SelectItem>
              </Select>
              <FormInput
                label={t("notificationLink")}
                name="notificationLink"
                onChange={handleChange}
                value={data.notificationLink}
                type="text"
                isRequired={false}
              />
            </div>
          )}
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
