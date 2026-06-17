import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const store = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    store.restoreSession();
    setIsHydrated(true);
  }, []);

  return { ...store, isHydrated };
};
