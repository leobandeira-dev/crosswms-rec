import { toast as sonnerToast } from "sonner";

// Função toast simples que garante compatibilidade
export const toast = (options: any) => {
  if (typeof options === 'string') {
    return sonnerToast(options);
  } else if (options && options.title) {
    return sonnerToast(options.title, {
      description: options.description,
      duration: options.duration,
    });
  } else {
    return sonnerToast(options);
  }
};

// Hook compatível
export const useToast = () => {
  return { toast };
};