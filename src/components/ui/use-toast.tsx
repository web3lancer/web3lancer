// Minimal placeholder for useToast
export function useToast() {
  return {
    toast: ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
      // You can replace this with a real toast implementation
      console.log(`[${variant || 'info'}] ${title}: ${description}`);
    },
  };
}
