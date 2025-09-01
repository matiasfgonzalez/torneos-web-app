import type React from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export function GradientText({
  children,
  className,
}: Readonly<GradientTextProps>) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}
