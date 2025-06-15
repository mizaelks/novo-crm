
import { toast as sonnerToast } from "sonner";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export const enhancedToast = {
  success: (message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      className: "border-green-200 bg-green-50",
    });
  },

  error: (message: string, options?: ToastOptions) => {
    sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000,
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      className: "border-red-200 bg-red-50",
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      className: "border-yellow-200 bg-yellow-50",
    });
  },

  info: (message: string, options?: ToastOptions) => {
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      icon: <Info className="h-4 w-4 text-blue-500" />,
      className: "border-blue-200 bg-blue-50",
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return sonnerToast.loading(message, {
      description: options?.description,
    });
  },
};
