"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LoadingSequence({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Wait for fade out
    }, 2000); // Show loading for 2s

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 2, ease: "easeInOut" }}
      onAnimationComplete={() => setIsVisible(false)}
    >
      <div className="flex flex-col items-center">
        <motion.div
          className="relative flex items-center justify-center h-24 w-24"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Animated rings for neural network forming effect */}
          <motion.div
            className="absolute inset-0 rounded-full border border-blue-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-indigo-400/50"
            animate={{ scale: [1, 1.2, 1], rotate: 180 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <span className="font-extrabold text-3xl tracking-tight text-white z-10">
            LOOP
          </span>
        </motion.div>
        
        <motion.div
          className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-slate-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
        <motion.p
          className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Initializing Intelligence...
        </motion.p>
      </div>
    </motion.div>
  );
}
