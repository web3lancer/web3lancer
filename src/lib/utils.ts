import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combine classes with tailwind-merge for optimal output
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to a human-readable string
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format contract status for display
export function formatContractStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
}

// Get appropriate color for contract status
export function getStatusColor(status: string): string {
  const colors = {
    draft: "gray",
    active: "green",
    in_progress: "blue",
    completed: "blue",
    cancelled: "red",
    disputed: "yellow",
    rejected: "red",
    pending: "orange",
    accepted: "green",
    withdrawn: "gray",
    paid: "purple",
    submitted_for_approval: "teal",
    approved: "green"
  };

  return colors[status as keyof typeof colors] || "gray";
}