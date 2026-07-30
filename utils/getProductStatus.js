export function getProductStatus(product, t) {
  const { deleted, hidden, rejected, approved, pendingChanges } = product;

  const status = [
    { label: t("deleted"), condition: deleted, className: "bg-red-600" },
    { label: t("hidden"), condition: hidden, className: "bg-gray-500" },
    {
      label: t("pendingReview"),
      condition: approved && pendingChanges?.needsReview,
      className: "bg-gradient-to-tr from-[#6366f1] to-[#818cf8]",
    },
    {
      label: t("editRejected"),
      condition:
        approved &&
        pendingChanges &&
        !pendingChanges.needsReview &&
        pendingChanges.rejectMessage,
      className: "bg-dangerRed",
    },
    { label: t("rejected"), condition: rejected, className: "bg-dangerRed" },
    {
      label: t("approved"),
      condition: approved,
      className: "bg-successGreen",
      type: "approved",
    },
    {
      label: t("pendingApproval"),
      condition: !approved && !rejected,
      className: "bg-primary",
    },
  ];

  return status.find((item) => item.condition);
}
