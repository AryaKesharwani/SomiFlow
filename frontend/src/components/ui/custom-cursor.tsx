import { useEffect, useRef } from "react";
import gsap from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    if (!cursor || !cursorDot) return;

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.to(cursorDot, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
      });
    };

    // Hover effects on interactive elements
    const handleMouseEnter = () => {
      gsap.to(cursor, {
        scale: 1.5,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);

    // Add hover listeners to all interactive elements
    const interactiveElements = document.querySelectorAll(
      "a, button, [role='button'], input, textarea"
    );
    
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter as EventListener);
      el.addEventListener("mouseleave", handleMouseLeave as EventListener);
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter as EventListener);
        el.removeEventListener("mouseleave", handleMouseLeave as EventListener);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="custom-cursor pointer-events-none fixed top-0 left-0 w-8 h-8 border-2 border-gray-400 rounded-full -translate-x-1/2 -translate-y-1/2 z-[9999] mix-blend-difference hidden md:block"
        style={{ willChange: "transform" }}
      />
      <div
        ref={cursorDotRef}
        className="custom-cursor-dot pointer-events-none fixed top-0 left-0 w-1.5 h-1.5 bg-gray-300 rounded-full -translate-x-1/2 -translate-y-1/2 z-[9999] mix-blend-difference hidden md:block"
        style={{ willChange: "transform" }}
      />
    </>
  );
}
