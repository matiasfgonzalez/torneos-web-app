import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline";
  [x: string]: any;
}

export function GradientButton({
  children,
  className,
  variant = "primary",
  ...props
}: Readonly<GradientButtonProps>) {
  return (
    <Button
      className={cn(
        variant === "primary"
          ? "bg-gradient-to-r from-[#ad45ff] to-[#a3b3ff] hover:from-[#9d35ef] hover:to-[#93a3ef] text-white"
          : "border-[#ad45ff] text-[#ad45ff] hover:bg-[#ad45ff] hover:text-white bg-transparent",
        className
      )}
      variant={variant === "outline" ? "outline" : "default"}
      {...props}
    >
      {children}
    </Button>
  );
}
