import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children: ReactNode;
  variant?: "primary" | "outline";
  size?: "sm" | "md" | "lg";
}
export function GradientButton({
  children,
  className,
  size,
  variant = "primary",
  ...props
}: Readonly<GradientButtonProps>) {
  return (
    <Button
      className={cn(
        variant === "primary"
          ? "bg-gradient-to-r from-brand to-brand-2 hover:from-brand-hover hover:to-brand-2-hover text-white"
          : "border-brand text-brand hover:bg-brand hover:text-white bg-transparent",
        size === "sm"
          ? "px-4 py-2 text-sm"
          : size === "lg"
          ? "px-6 py-3 text-lg"
          : "px-5 py-2.5 text-md",
        "font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand/50",
        className
      )}
      variant={variant === "outline" ? "outline" : "default"}
      {...props}
    >
      {children}
    </Button>
  );
}

