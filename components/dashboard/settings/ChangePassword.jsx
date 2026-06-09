"use client";
import { useState } from "react";
import { Input } from "@heroui/react";
import Button from "../../ui/Button";
import { toast } from "@/utils/toast";
import ToastMessage from "../../ui/ToastMessage";
import { Eye } from "../../ui/svgs/icons/EyeSvg";
import { Key } from "../../ui/svgs/icons/KeySvg";

function FormInput({ ...props }) {
  return (
    <Input
      isRequired
      labelPlacement="outside"
      classNames={{
        mainWrapper: "mt-14",
        label: "md:text-lg text-base -mt-2 flex items-center",
        base: "max-w-full !mt-0",
        input: "md:text-base text-sm",
        inputWrapper: "bg-gray-100 h-12",
      }}
      {...props}
    />
  );
}

export default function ChangePassword({ t }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = ({ target: { name, value } }) =>
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

  const updatePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(ToastMessage(t("changePassword.passwordMismatch")));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || t("changePassword.error"));
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success(ToastMessage(t("changePassword.success")));
    } catch (err) {
      toast.error(ToastMessage(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="md:p-10 p-6 bg-white rounded-lg">
      <h2 className="lg:text-[1.8rem] md:text-[1.6rem] text-[1.05rem] font-semibold text-darkNavy font-IBMPlex mb-1 1 md:mt-0 mt-2">
        {t("changePassword.title")}
      </h2>
      <form onSubmit={updatePassword}>
        <div className="w-full">
          <FormInput
            label={t("changePassword.currentPassword")}
            name="currentPassword"
            onChange={handleInputChange}
            value={passwordData.currentPassword}
            placeholder="*******"
            type={isPasswordVisible ? "text" : "password"}
            startContent={<Key />}
            endContent={
              <Button
                color="transparent"
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                className="focus:outline-none opacity-50 rounded-lg min-w-0 -translate-x-2 px-4"
              >
                <Eye />
              </Button>
            }
          />
        </div>

        <div className="flex flex-col md:flex-row md:gap-4 gap-1 w-full">
          <div className="w-full md:w-1/2">
            <FormInput
              validate={(value) =>
                !value?.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/) &&
                t("changePassword.validation")
              }
              label={t("changePassword.newPassword")}
              name="newPassword"
              onChange={handleInputChange}
              value={passwordData.newPassword}
              placeholder="*******"
              type={isNewPasswordVisible ? "text" : "password"}
              startContent={<Key />}
              endContent={
                <Button
                  color="transparent"
                  onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
                  className="focus:outline-none opacity-50 rounded-lg min-w-0 -translate-x-2 px-4"
                >
                  <Eye />
                </Button>
              }
            />
          </div>
          <div className="w-full md:w-1/2">
            <FormInput
              label={t("changePassword.confirmPassword")}
              name="confirmPassword"
              onChange={handleInputChange}
              value={passwordData.confirmPassword}
              placeholder="*******"
              type={isConfirmPasswordVisible ? "text" : "password"}
              startContent={<Key />}
              endContent={
                <Button
                  color="transparent"
                  onPress={() =>
                    setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                  }
                  className="focus:outline-none opacity-50 rounded-lg min-w-0 -translate-x-2 px-4"
                >
                  <Eye />
                </Button>
              }
            />
          </div>
        </div>

        <div className="text-end md:mt-8 mt-4">
          <Button
            isLoading={isLoading}
            type="submit"
            className="md:py-6 py-4 min-w-40 md:text-lg text-base font-IBMPlex"
          >
            {t("changePassword.updateButton")}
          </Button>
        </div>
      </form>
    </div>
  );
}
