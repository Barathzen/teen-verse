"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/config/firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { useAuthStore } from "@/store/authStore";

/**
 * Shared hook for Google authentication.
 *
 * Strategy:
 * 1. Try signInWithPopup (works on most desktop browsers).
 * 2. If popup is blocked, fall back to signInWithRedirect.
 * 3. An onAuthStateChanged listener picks up the signed-in user
 *    regardless of which flow succeeded and calls the backend.
 */
export function useGoogleAuth() {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  // Prevent processing the same Firebase user more than once
  const processedUidRef = useRef<string | null>(null);

  // ------------------------------------------------------------------
  // 1. Check for a pending redirect result on mount.
  //    This fires when the page reloads after signInWithRedirect.
  // ------------------------------------------------------------------
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          await handleFirebaseUser(result.user);
        }
      })
      .catch((err) => {
        console.error("Google redirect result error:", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------------
  // 2. Listen for auth state changes.
  //    This is the safety net: if the redirect result was lost but
  //    Firebase still knows the user is signed in, we catch it here.
  // ------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && processedUidRef.current !== firebaseUser.uid) {
        // Only process if we haven't already handled this user AND
        // the app isn't already authenticated (to avoid re-processing
        // on every page load for users who logged in via email/pw).
        const storeState = useAuthStore.getState();
        if (!storeState.isAuthenticated) {
          await handleFirebaseUser(firebaseUser);
        }
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------------
  // Process a Firebase user by calling the backend /auth/google endpoint
  // ------------------------------------------------------------------
  const handleFirebaseUser = async (user: FirebaseUser) => {
    // Mark as processed so we don't double-fire
    processedUidRef.current = user.uid;
    setGoogleLoading(true);
    setGoogleError(null);

    try {
      const userEmail = user.email || "";
      const userName = user.displayName || "Google User";
      const userUid = user.uid;

      await useAuthStore.getState().googleLogin(userEmail, userName, userUid);
      const currentUser = useAuthStore.getState().user;
      router.push(
        currentUser?.role === "admin" ? "/dashboard" : "/dashboard/assessment"
      );
    } catch (err: any) {
      console.error("Backend Google login error:", err);
      setGoogleError(err?.response?.data?.detail || "Google login failed");
      // Sign out from Firebase so the listener doesn't re-fire
      await auth.signOut();
      processedUidRef.current = null;
    } finally {
      setGoogleLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Trigger Google sign-in (popup first, redirect fallback)
  // ------------------------------------------------------------------
  const handleGoogleLogin = useCallback(async () => {
    setGoogleError(null);
    setGoogleLoading(true);

    try {
      // Attempt popup first
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await handleFirebaseUser(result.user);
      }
    } catch (popupError: any) {
      const code = popupError?.code || "";
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        // Popup was blocked or closed – fall back to redirect
        console.warn("Popup blocked, falling back to redirect flow");
        try {
          await signInWithRedirect(auth, googleProvider);
          // Page will reload; getRedirectResult / onAuthStateChanged
          // will handle the result on return.
        } catch (redirectError: any) {
          console.error("Redirect sign-in error:", redirectError);
          setGoogleError("Google sign-in failed. Please try again.");
          setGoogleLoading(false);
        }
      } else {
        console.error("Google sign-in error:", popupError);
        setGoogleError(popupError.message || "Google sign-in failed");
        setGoogleLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { handleGoogleLogin, googleLoading, googleError };
}
