"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, delay = 0.1, position = "top" }: TooltipProps) {
  const [active, setActive] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  const animations = {
    top: {
      initial: { opacity: 0, scale: 0.95, y: 4, x: "-50%" },
      animate: { opacity: 1, scale: 1, y: 0, x: "-50%" },
      exit: { opacity: 0, scale: 0.95, y: 4, x: "-50%" }
    },
    bottom: {
      initial: { opacity: 0, scale: 0.95, y: -4, x: "-50%" },
      animate: { opacity: 1, scale: 1, y: 0, x: "-50%" },
      exit: { opacity: 0, scale: 0.95, y: -4, x: "-50%" }
    },
    left: {
      initial: { opacity: 0, scale: 0.95, x: 4, y: "-50%" },
      animate: { opacity: 1, scale: 1, x: 0, y: "-50%" },
      exit: { opacity: 0, scale: 0.95, x: 4, y: "-50%" }
    },
    right: {
      initial: { opacity: 0, scale: 0.95, x: -4, y: "-50%" },
      animate: { opacity: 1, scale: 1, x: 0, y: "-50%" },
      exit: { opacity: 0, scale: 0.95, x: -4, y: "-50%" }
    }
  };

  const selectedAnimation = animations[position];

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={selectedAnimation.initial}
            animate={selectedAnimation.animate}
            exit={selectedAnimation.exit}
            transition={{ duration: 0.12, delay }}
            className={`absolute z-50 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-[10px] font-bold text-slate-50 border border-slate-800/80 shadow-xl dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700/60 pointer-events-none ${positionClasses[position]}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
