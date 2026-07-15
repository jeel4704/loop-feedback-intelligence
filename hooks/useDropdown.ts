"use client";

import { useState, useRef, useCallback } from "react";
import { useClickOutside } from "./useClickOutside";
import { useKeyboardShortcut } from "./useKeyboardShortcut";

export function useDropdown(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useClickOutside(ref, close);
  
  useKeyboardShortcut("Escape", close);

  return { isOpen, toggle, open, close, ref };
}
