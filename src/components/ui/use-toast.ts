
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

// Define our own ToasterToast type since it's not exported from sonner
type ToasterToast = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  [key: string]: any;
};

export const toast = ({ title, description, action, variant }: ToastProps) => {
  return sonnerToast(title, {
    description,
    action,
    className: variant === "destructive" ? "destructive" : undefined,
  });
};

// Create a custom hook that returns an object with the toast function
// This mimics the shape expected by components using useToast
export const useToast = () => {
  return {
    toast: (props: ToastProps) => toast(props),
    toasts: [] as ToasterToast[],
    dismiss: sonnerToast.dismiss,
    error: sonnerToast.error,
    success: sonnerToast.success,
    loading: sonnerToast.loading,
    promise: sonnerToast.promise,
    custom: sonnerToast.custom,
  };
};

export type { ToastProps };
