import { useEffect, useRef, type RefObject } from "react";

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const MIN_DISTANCE = 60;
const MAX_VERTICAL = 80;

/**
 * Detects horizontal swipe gestures on a container element.
 * Uses touch events which bubble reliably from scrollable children.
 * Only fires if horizontal distance exceeds threshold and
 * vertical movement stays within bounds (won't hijack scrolling).
 */
export function useSwipe<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { onSwipeLeft, onSwipeRight }: SwipeHandlers
): void {
  const startX = useRef(0);
  const startY = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX.current;
      const dy = Math.abs(touch.clientY - startY.current);

      if (dy > MAX_VERTICAL) return;
      if (Math.abs(dx) < MIN_DISTANCE) return;

      if (dx < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight]);
}
