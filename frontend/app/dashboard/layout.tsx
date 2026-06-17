"use client";

import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Loading } from "@/components/common/Loading";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated, user } = useAuth();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login");
    } else if (isHydrated && isAuthenticated && user) {
      if (
        user.role !== "admin" &&
        (pathname === "/dashboard" ||
          pathname === "/dashboard/analytics" ||
          pathname === "/dashboard/simulation" ||
          pathname === "/dashboard/assessment")
      ) {
        router.push("/dashboard/prediction");
      }
    }
  }, [isAuthenticated, isHydrated, user, pathname, router]);

  if (!isHydrated) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Loading message="Redirecting..." />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 mt-16 md:mt-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
