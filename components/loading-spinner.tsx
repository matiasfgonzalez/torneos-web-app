import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    className?: string;
}

export function LoadingSpinner({
    size = "md",
    text = "Cargando...",
    className
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8"
    };

    const textSizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg"
    };

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center space-y-2",
                className
            )}
        >
            <Loader2
                className={cn("animate-spin text-primary", sizeClasses[size])}
            />
            {text && (
                <p
                    className={cn(
                        "text-muted-foreground",
                        textSizeClasses[size]
                    )}
                >
                    {text}
                </p>
            )}
        </div>
    );
}

export function LoadingCard({
    title,
    description
}: {
    title?: string;
    description?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {description && (
                <p className="text-muted-foreground text-center">
                    {description}
                </p>
            )}
        </div>
    );
}

export function LoadingPage({
    message = "Cargando página..."
}: {
    message?: string;
}) {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <LoadingSpinner size="lg" text={message} />
        </div>
    );
}
