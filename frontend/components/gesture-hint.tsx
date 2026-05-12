"use client";

import { useEffect, useState } from "react";
import { HandRaisedIcon, XMarkIcon } from "@heroicons/react/24/outline";

const STORAGE_KEY = "gesture-hint-dismissed";

/**
 * One-time onboarding tooltip that tells the user about swipe gestures.
 * Dismisses on tap and remembers via localStorage.
 */
export function GestureHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl bg-brand/95 text-white px-5 py-3 shadow-xl backdrop-blur-sm">
        <HandRaisedIcon className="w-5 h-5 shrink-0 opacity-80" aria-hidden="true" />
        <p className="text-sm font-medium">
          Swipe left/right to navigate steps
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss gesture hint"
          className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
