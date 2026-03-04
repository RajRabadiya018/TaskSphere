"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { AppDispatch, RootState } from "@/store";
import { hydrateToken, loadUser } from "@/store/authSlice";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";


const PUBLIC_ROUTES = ["/login", "/signup"];

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

  const initialCheckDone = _hydrated && (!token || !!user || userLoadAttempted);

  useEffect(() => {
    dispatch(hydrateToken());
  }, [dispatch]);

  useEffect(() => {
    if (!_hydrated || userLoadAttempted) return;

    if (token && !user) {
      dispatch(loadUser()).finally(() => setUserLoadAttempted(true));
    }
  }, [_hydrated, token, user, userLoadAttempted, dispatch]);

  useEffect(() => {
    if (!initialCheckDone) return;

    if (!token && !isPublicRoute) {
      router.replace("/login");
    }
  }, [initialCheckDone, token, isPublicRoute, router]);

  if (!_hydrated || (!initialCheckDone && token)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!token && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
