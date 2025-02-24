import { toast } from 'react-toastify';
import type { ToastContent, ToastOptions } from 'react-toastify';

// Custom toast functions
export const showSuccessToast = (
  message: ToastContent,
  options: ToastOptions = {},
) => {
  toast.success(message, { autoClose: 1000, ...options });
};

export const showErrorToast = (
  message: ToastContent,
  options: ToastOptions = {},
) => {
  toast.error(message, { autoClose: false, ...options });
};
