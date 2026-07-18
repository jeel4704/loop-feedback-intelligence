import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "icon" | "horizontal" | "stacked";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({
  variant = "horizontal",
  size = "md",
  className,
  iconClassName,
  textClassName,
}: LogoProps) {
  // Map sizes
  const sizeMap = {
    sm: { icon: "w-5 h-5", text: "text-sm", gap: "gap-1.5" },
    md: { icon: "w-7 h-7", text: "text-xl", gap: "gap-2" },
    lg: { icon: "w-10 h-10", text: "text-3xl", gap: "gap-3" },
    xl: { icon: "w-16 h-16", text: "text-5xl", gap: "gap-4" },
  };

  const { icon: iconSize, text: textSize, gap } = sizeMap[size];

  const Icon = () => (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", iconSize, iconClassName)}
    >
      <defs>
        <linearGradient id="loopGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" /> {/* Electric Indigo */}
          <stop offset="100%" stopColor="#2563EB" /> {/* Royal Blue */}
        </linearGradient>
        <linearGradient id="wedgeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7C3AED" /> {/* Deep Purple */}
          <stop offset="100%" stopColor="#06B6D4" /> {/* Modern Cyan */}
        </linearGradient>
        <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" /> {/* Cyan */}
          <stop offset="100%" stopColor="#4F46E5" /> {/* Indigo */}
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 
        Abstract Geometric Design:
        1. 3/4 Circular Continuous Loop (Feedback/Continuous Integration)
        2. Sharp Top-Right Prism/Wedge (Data Output/Enterprise Precision)
        3. Central Intelligence Core (AI Node)
      */}
      
      {/* 3/4 Thick Geometric Loop */}
      <path 
        d="M 50 12 A 38 38 0 1 0 88 50 L 68 50 A 18 18 0 1 1 50 32 Z" 
        fill="url(#loopGrad)" 
      />
      
      {/* Precision Insight Wedge */}
      <path 
        d="M 50 6 L 94 6 L 94 50 A 44 44 0 0 0 50 6 Z" 
        fill="url(#wedgeGrad)" 
      />
      
      {/* Central AI Node */}
      <circle 
        cx="50" cy="50" r="7" 
        fill="url(#coreGrad)" 
        filter="url(#glow)" 
      />
    </svg>
  );

  if (variant === "icon") {
    return (
      <div className={cn("inline-flex items-center justify-center", className)}>
        <Icon />
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center justify-center", gap, className)}>
        <Icon />
        <span
          className={cn(
            "font-extrabold tracking-tighter text-slate-950 dark:text-white",
            textSize,
            textClassName
          )}
          style={{ fontFamily: "Inter, 'Plus Jakarta Sans', sans-serif" }}
        >
          LOOP
        </span>
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className={cn("flex items-center", gap, className)}>
      <Icon />
      <span
        className={cn(
          "font-extrabold tracking-tighter text-slate-950 dark:text-white",
          textSize,
          textClassName
        )}
        style={{ fontFamily: "Inter, 'Plus Jakarta Sans', sans-serif" }}
      >
        LOOP
      </span>
    </div>
  );
}
