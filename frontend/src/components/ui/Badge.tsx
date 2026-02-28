import type { PropsWithChildren } from "react";

type BadgeVariant = "success" | "warning" | "danger";

const variants: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function Badge({ children, variant }: PropsWithChildren<{ variant: BadgeVariant }>) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>;
}
