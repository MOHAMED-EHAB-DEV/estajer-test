export function getProductStatus(product, t) {
  const { deleted, hidden, rejected, approved } = product;

  const status = [
    { label: t("deleted"), condition: deleted, className: "bg-red-600" },
    { label: t("hidden"), condition: hidden, className: "bg-gray-500" },
    { label: t("rejected"), condition: rejected, className: "bg-[#F44242]" },
    {
      label: t("approved"),
      condition: approved,
      className: "bg-[#4FD658]",
      type: "approved",
    },
    {
      label: t("pendingApproval"),
      condition: !approved && !rejected,
      className: "bg-[#F48A42]",
    },
  ];

  return status.find((item) => item.condition);
}
