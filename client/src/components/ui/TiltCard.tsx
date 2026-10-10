import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  sheen?: boolean;
}

/**
 * Classy, taste-compliant 3D perspective card.
 * Uses GSAP physics for fluid 3D tilt and mouse-following sheen reflections.
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  maxTilt = 8,
  sheen = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const card = cardRef.current;
    if (!card) return;

    // Set initial 3D transform perspective
    gsap.set(card, {
      transformPerspective: 1000,
      transformStyle: "preserve-3d",
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      // Animate card tilt smoothly
      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });

      // Animate dynamic light sheen reflection
      if (sheenRef.current) {
        const sheenX = (x / rect.width) * 100;
        const sheenY = (y / rect.height) * 100;
        gsap.to(sheenRef.current, {
          background: `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%)`,
          duration: 0.2,
          ease: "none",
        });
      }
    };

    const handleMouseLeave = () => {
      // Smooth spring back to resting state
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto",
      });

      if (sheenRef.current) {
        gsap.to(sheenRef.current, {
          background: "transparent",
          duration: 0.4,
        });
      }
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, { scope: cardRef });

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative rounded-lg bg-white border border-slate-200 shadow-sm transition-shadow hover:shadow-md will-change-transform overflow-hidden",
        className
      )}
    >
      {/* Dynamic Specular Sheen Overlay */}
      {sheen && (
        <div
          ref={sheenRef}
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
      <div className="relative z-0 h-full">{children}</div>
    </div>
  );
};
