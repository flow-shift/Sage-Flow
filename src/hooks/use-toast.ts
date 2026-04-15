import toast from "react-hot-toast";

export function useToast() {
  return {
    toast: ({ title, description, variant }: { title: string; description?: string; variant?: "destructive" | "default" }) => {
      const msg = description ? `${title}\n${description}` : title;
      if (variant === "destructive") {
        toast.error(msg);
      } else {
        toast.success(msg);
      }
    },
  };
}

export { toast };
