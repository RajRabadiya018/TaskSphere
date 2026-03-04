"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const router = useRouter();
    const { user, token, status } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        // If no token redirect
        if (!token) {
            router.replace("/login");
            return;
        }
        if (!user && status !== "loading" && status !== "idle") {
            router.replace("/login");
        }
    }, [user, token, status, router]);

    if (status === "loading" || (token && !user && status === "idle")) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner size="lg" label="Loading..." />
            </div>
        );
    }
    if (!token || !user) {
        return null;
    }

    return <>{children}</>;
}
