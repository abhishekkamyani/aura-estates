"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { FEATURED_CARD_SHELL, FeaturedCardContent } from "@/components/property/FeaturedCardContent";
import type { PropertyDTO } from "@/types/property";

const SPRING = { stiffness: 180, damping: 20, mass: 0.6 };
const MAX_TILT_X = 9; // degrees around the X axis (vertical mouse movement)
const MAX_TILT_Y = 11; // degrees around the Y axis (horizontal mouse movement)

interface TiltPropertyCard3DProps {
  property: PropertyDTO;
  priority?: boolean;
}

/**
 * Featured property card with a physically-inspired 3D tilt:
 * - perspective + `preserve-3d` so inner layers (image, badges, copy) sit at different depths
 * - spring-smoothed X/Y rotation driven by the pointer position
 * - a moving specular glare highlight that follows the cursor
 * Touch devices and users who prefer reduced motion get a flat card.
 */
export default function TiltPropertyCard3D({ property, priority }: TiltPropertyCard3DProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // Pointer position normalised to 0..1 within the card.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(py, [0, 1], [MAX_TILT_X, -MAX_TILT_X]), SPRING);
  const rotateY = useSpring(useTransform(px, [0, 1], [-MAX_TILT_Y, MAX_TILT_Y]), SPRING);
  const scale = useSpring(1, SPRING);
  const lift = useSpring(0, SPRING);

  const glareX = useTransform(px, [0, 1], [0, 100]);
  const glareY = useTransform(py, [0, 1], [0, 100]);
  const glareOpacity = useSpring(0, { stiffness: 120, damping: 20 });
  const glare = useMotionTemplate`radial-gradient(farthest-corner circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 28%, rgba(255,255,255,0) 62%)`;

  // Shadow drifts opposite to the tilt for a grounded, realistic feel.
  const shadowX = useTransform(px, [0, 1], [18, -18]);
  const shadowY = useTransform(py, [0, 1], [18, 34]);
  const shadow = useMotionTemplate`${shadowX}px ${shadowY}px 60px -18px rgba(15, 23, 42, 0.28)`;
  const sheen = useMotionTemplate`radial-gradient(600px circle at ${glareX}% ${glareY}%, rgba(197,160,89,0.10), transparent 45%)`;

  const canTilt = (e: React.PointerEvent) => !reduceMotion && e.pointerType === "mouse";

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    if (!canTilt(e) || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handlePointerEnter(e: React.PointerEvent<HTMLElement>) {
    if (!canTilt(e)) return;
    scale.set(1.025);
    lift.set(-6);
    glareOpacity.set(1);
  }

  function handlePointerLeave() {
    px.set(0.5);
    py.set(0.5);
    scale.set(1);
    lift.set(0);
    glareOpacity.set(0);
  }

  return (
    <div className="h-full" style={{ perspective: 1400 }}>
      <motion.article
        ref={ref}
        aria-label={property.title}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX,
          rotateY,
          scale,
          y: lift,
          boxShadow: shadow,
          transformStyle: "preserve-3d",
        }}
        className={`${FEATURED_CARD_SHELL} will-change-transform`}
      >
        <FeaturedCardContent
          property={property}
          priority={priority}
          depth
          glare={
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 mix-blend-soft-light"
              style={{ background: glare, opacity: glareOpacity }}
            />
          }
        />
        {/* Thin specular edge highlight across the whole card surface */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            opacity: glareOpacity,
            background: sheen,
            transform: "translateZ(1px)",
          }}
        />
      </motion.article>
    </div>
  );
}
