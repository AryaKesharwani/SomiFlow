import { useEffect, useRef } from "react";
import gsap from "gsap";

interface AnimatedTextProps {
  children: string;
  className?: string;
  delay?: number;
}

export function AnimatedText({ children, className = "", delay = 0 }: AnimatedTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const text = textRef.current;
    const chars = text.textContent?.split("") || [];
    
    // Clear and wrap each character in a span
    text.innerHTML = chars
      .map((char) => `<span class="inline-block" style="opacity: 0">${char === " " ? "&nbsp;" : char}</span>`)
      .join("");

    const charElements = text.querySelectorAll("span");

    // Animate each character
    gsap.to(charElements, {
      opacity: 1,
      y: 0,
      duration: 0.05,
      stagger: 0.03,
      delay: delay,
      ease: "power2.out",
    });
  }, [children, delay]);

  return (
    <span ref={textRef} className={className}>
      {children}
    </span>
  );
}

interface GlitchTextProps {
  children: string;
  className?: string;
}

export function GlitchText({ children, className = "" }: GlitchTextProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const element = textRef.current;
    
    // Random glitch effect on hover
    const handleMouseEnter = () => {
      const tl = gsap.timeline();
      
      tl.to(element, {
        x: -2,
        duration: 0.05,
        repeat: 3,
        yoyo: true,
      })
      .to(element, {
        x: 2,
        duration: 0.05,
        repeat: 2,
        yoyo: true,
      })
      .to(element, {
        x: 0,
        duration: 0.1,
      });
    };

    element.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <span ref={textRef} className={className} style={{ display: "inline-block" }}>
      {children}
    </span>
  );
}
