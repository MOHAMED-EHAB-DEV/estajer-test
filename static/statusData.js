const statusData = {
  "not-paid": {
    color: "#8B726E",
    text: "غير مدفوع",
  },
  pending: {
    color: "#9747FF",
    text: "طلب مدفوع",
  },
  confirmed: {
    color: "#4FD6B6",
    text: "طلب مؤكد",
  },
  received: {
    color: "#f48a42",
    text: "تم استلامه",
  },
  completed: {
    color: "#4fd658",
    text: "مكتمل",
  },
  "not-returned": {
    color: "#E74C3C",
    text: "لم يتم ارجاعه",
  },
  rejecting: {
    color: "#F44242",
    text: "جاري الغاءه",
  },
  cancelled: {
    color: "#F44242",
    text: "ملغى",
  },
};

export { statusData };
