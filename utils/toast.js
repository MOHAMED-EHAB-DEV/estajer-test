/**
 * Dynamic toast utility to keep react-toastify out of the main bundle.
 * Loads the library only when a toast is actually triggered.
 */
export const showToast = async (message, type = "success", options = {}) => {
  const { toast } = await import("react-toastify");
  return toast[type](message, options);
};

// Add helper for different types if needed
export const toast = {
  success: (msg, opts) => showToast(msg, "success", opts),
  error: (msg, opts) => showToast(msg, "error", opts),
  info: (msg, opts) => showToast(msg, "info", opts),
  warning: (msg, opts) => showToast(msg, "warning", opts),
  loading: (msg, opts) => showToast(msg, "loading", opts),
  dismiss: async (id) => {
    const { toast: rt } = await import("react-toastify");
    const resolvedId = await id;
    rt.dismiss(resolvedId);
  },
};
