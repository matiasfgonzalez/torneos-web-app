import ResponsiveHeader from "@/components/responsive-header";
import type React from "react";

export default function AdminLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <ResponsiveHeader />
            {children}
        </div>
    );
}
