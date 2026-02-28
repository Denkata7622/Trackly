import type { HTMLAttributes, PropsWithChildren } from "react";

export function Card({ children, className = "", ...props }: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <section className={`bg-surface border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`} {...props}>
      {children}
    </section>
  );
}
