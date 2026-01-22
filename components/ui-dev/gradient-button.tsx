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
          ? "bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white"
          : "border-[#ad45ff] text-[#ad45ff] hover:bg-[#ad45ff] hover:text-white bg-transparent",
        size === "sm"
          ? "px-4 py-2 text-sm"
          : size === "lg"
          ? "px-6 py-3 text-lg"
          : "px-5 py-2.5 text-md",
        "font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ad45ff]/50",
        className
      )}
      variant={variant === "outline" ? "outline" : "default"}
      {...props}
    >
      {children}
    </Button>
  );
}

