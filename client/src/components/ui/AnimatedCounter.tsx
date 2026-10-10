import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

/**
 * High-precision GSAP numerical roll-up ticker.
 * Smoothly decelerates with luxury easing.
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.4,
  className = "",
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const countObj = useRef({ count: 0 });

  useGSAP(() => {
    if (!spanRef.current) return;

    countObj.current.count = 0;

    gsap.to(countObj.current, {
      count: value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        if (spanRef.current) {
          const formatted = countObj.current.count.toFixed(decimals);
          spanRef.current.textContent = `${prefix}${formatted}${suffix}`;
        }
      },
    });
  }, [value, decimals, prefix, suffix, duration]);

  return (
    <span ref={spanRef} className={className}>
      {prefix}0{suffix}
    </span>
  );
};
