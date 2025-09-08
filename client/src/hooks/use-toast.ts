export const toast = (opts: { title?: string; description?: string }) => {
  if (opts?.title || opts?.description) {
    console.log('[toast]', opts.title, opts.description);
  }
};

export const useToast = () => ({ toast });


import { useToast, toast } from "@/components/ui/use-toast";

export { useToast, toast };
