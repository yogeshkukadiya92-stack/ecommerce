import Link from "next/link";
import type { LinkProps } from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  href: LinkProps["href"];
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "dark";
};

export function Button({
  children,
  className,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <Link
      className={cn(
        "focus-ring inline-flex items-center justify-center rounded-md font-semibold transition",
        size === "sm" && "min-h-9 px-3 py-2 text-xs",
        size === "md" && "min-h-11 px-5 py-3 text-sm",
        size === "lg" && "min-h-12 px-6 py-3 text-base",
        variant === "primary" && "bg-lime text-ink hover:bg-mint",
        variant === "secondary" && "border border-black/10 bg-white text-ink hover:border-ink",
        variant === "ghost" && "bg-transparent text-ink hover:bg-black/5",
        variant === "dark" && "bg-ink text-white hover:bg-forest",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
