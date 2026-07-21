import type React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SectionBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionBadge({
  children,
  className,
}: Readonly<SectionBadgeProps>) {
  return (
    <Badge
      className={cn(
        "bg-gradient-to-r from-brand to-brand-2 text-white border-0",
        className
      )}
    >
      {children}
    </Badge>
  );
}

