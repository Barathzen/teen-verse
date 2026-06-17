"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * The `/dashboard/assessment/create` route was previously empty. To provide a
 * smooth user experience we automatically redirect to the main assessment
 * creation page (`/dashboard/assessment`).
 */
export default function CreateRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/assessment");
  }, [router]);

  return null;
}
