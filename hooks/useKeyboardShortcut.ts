"use client";

import { useEffect } from "react";

interface ShortcutOptions {
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: (e: KeyboardEvent) => void,
  options: ShortcutOptions = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. Never intercept when the user is typing in an input, textarea, or contenteditable
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const matchKey = event.key.toLowerCase() === key.toLowerCase();
      
      // 2. Exact modifier matching (if true, must be pressed; if undefined/false, must NOT be pressed)
      // On macOS, Cmd maps to metaKey. We treat ctrlKey or metaKey as equivalent for typical web shortcuts.
      const wantCtrl = !!options.ctrlKey;
      const hasCtrl = event.ctrlKey || event.metaKey;
      const ctrlCheck = wantCtrl === hasCtrl;

      const wantAlt = !!options.altKey;
      const altCheck = wantAlt === event.altKey;

      const wantShift = !!options.shiftKey;
      const shiftCheck = wantShift === event.shiftKey;

      if (matchKey && ctrlCheck && altCheck && shiftCheck) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, callback, options]);
}
