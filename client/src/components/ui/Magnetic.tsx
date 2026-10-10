import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface MagneticProps {
  children: React.ReactElement<{ className?: string }>;
  strength?: number; // 0.15 - 0.45
  className?: string;
}

/**
 * GSAP-powered Magnetic physics container.
 * Subtly draws the element toward the cursor on hover like award-winning agency portfolios.
 */
export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.28,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = el.getBoundingClientRect();

      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);

      gsap.to(el, {
        x: x * strength,
        y: y * strength,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.4)",
        overwrite: "auto",
      });
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, { scope: ref });

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
};
