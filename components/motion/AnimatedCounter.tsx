"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  /** Formats the in-flight number for display. */
  format?: (value: number) => string;
  duration?: number;
  className?: string;
}

const defaultFormat = (v: number) => Math.round(v).toLocaleString("en-US");

/**
 * Counts up from zero to `value` the first time it enters the viewport.
 * The number is rendered from a MotionValue, so no React re-renders occur per frame.
 */
export function AnimatedCounter({ value, format = defaultFormat, duration = 2, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(0);
  const text = useTransform(count, (latest) => format(latest));

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, value, duration, reduceMotion, count]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{format(value)}</span>
      <motion.span aria-hidden="true">{text}</motion.span>
    </span>
  );
}
