"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { AppDispatch, RootState } from "@/store";
import { hydrateToken, loadUser } from "@/store/authSlice";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

/** Public routes that don't require authentication */
const PUBLIC_ROUTES = ["/login", "/signup"];

/**
 * AuthLoader — handles session restoration + route protection.
 * 1. Hydrates token from localStorage on mount (avoids SSR mismatch).
 * 2. If token exists, fetches user from /api/auth/me.
 * 3. Redirects unauthenticated users to /login on protected routes.
 */
export default function AuthLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, _hydrated } = useSelector(
    (state: RootState) => state.auth,
  );
  const [userLoadAttempted, setUserLoadAttempted] = useState(false);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Derived: initial auth check is done when hydrated AND either no token or user loaded/attempted
  const initialCheckDone = _hydrated && (!token || !!user || userLoadAttempted);

  // Step 1: Hydrate token from localStorage (runs once on client mount)
  useEffect(() => {
    dispatch(hydrateToken());
  }, [dispatch]);

  // Step 2: Once hydrated, load user if token exists
  useEffect(() => {
    if (!_hydrated || userLoadAttempted) return;

    if (token && !user) {
      dispatch(loadUser()).finally(() => setUserLoadAttempted(true));
    }
  }, [_hydrated, token, user, userLoadAttempted, dispatch]);

  // Step 3: Redirect logic after initial check
  useEffect(() => {
    if (!initialCheckDone) return;

    if (!token && !isPublicRoute) {
      router.replace("/login");
    }
  }, [initialCheckDone, token, isPublicRoute, router]);

  // --- Rendering ---

  // Still hydrating or loading user session
  if (!_hydrated || (!initialCheckDone && token)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  // Not authenticated on a protected route — show nothing while redirecting
  if (!token && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
