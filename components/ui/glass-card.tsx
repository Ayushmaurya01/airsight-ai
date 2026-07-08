"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: "cyan" | "emerald" | "blue" | "amber" | "rose" | "none";
  animate?: boolean;
  hoverGlow?: boolean;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glowColor = "none",
  animate = true,
  hoverGlow = true,
  delay = 0,
  ...props
}) => {
  const glowClasses = {
    none: "border-white/10 dark:border-white/5 hover:border-white/20 dark:hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.02)]",
    cyan: "border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.08)] hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]",
    emerald: "border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.08)] hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    blue: "border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.08)] hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    amber: "border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.08)] hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    rose: "border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.08)] hover:border-rose-500/40 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]",
  };

  const CardWrapper = animate ? motion.div : "div";
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay },
      }
    : {};

  return (
    // @ts-ignore
    <CardWrapper
      {...animationProps}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-white/45 dark:bg-slate-900/40 backdrop-blur-2xl transition-all duration-500 ease-out",
        glowClasses[glowColor],
        hoverGlow && "hover:translate-y-[-4px] hover:scale-[1.015] hover:shadow-2xl hover:bg-white/55 dark:hover:bg-slate-900/50",
        className
      )}
      {...props}
    >
      {/* Gloss reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </CardWrapper>
  );
};
