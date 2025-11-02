import { Link } from "react-router-dom";
import { redirectToVincentConnect } from "../lib/vincentAuth";
import { useAuth } from "../contexts/AuthContext";
import { Spotlight } from "../components/ui/spotlight";
import { Terminal, TypingAnimation, AnimatedSpan } from "../components/ui/terminal";
import { CustomCursor } from "../components/ui/custom-cursor";
import { ParticleBackground } from "../components/ui/particle-background";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const badgeRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featureCardsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Hero Section Entrance Animation with autoAlpha (better than opacity)
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      
      if (badgeRef.current) {
        tl.from(badgeRef.current, {
          y: -30,
          autoAlpha: 0,
          duration: 0.8,
        });
      }
      
      if (h1Ref.current?.children.length) {
        tl.from(h1Ref.current.children, {
          y: 50,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.2,
        }, "-=0.4");
      }
      
      if (descRef.current) {
        tl.from(descRef.current, {
          y: 30,
          autoAlpha: 0,
          duration: 0.8,
        }, "-=0.6");
      }
      
      if (ctaRef.current?.children.length) {
        tl.from(ctaRef.current.children, {
          y: 20,
          autoAlpha: 0,
          duration: 0.6,
          stagger: 0.15,
        }, "-=0.4");
      }

      // Floating Logo Animation
      if (logoRef.current) {
        gsap.to(logoRef.current, {
          y: -10,
          rotation: 5,
          duration: 2.5,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1
        });
      }

      // Nav fade in
      if (navRef.current) {
        gsap.from(navRef.current, {
          y: -20,
          autoAlpha: 0,
          duration: 1,
          ease: "power2.out"
        });
      }

      // Feature Cards Scroll Animation
      if (featureCardsRef.current) {
        const cards = Array.from(featureCardsRef.current.children);
        if (cards.length) {
          gsap.from(cards, {
            scrollTrigger: {
              trigger: featureCardsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse"
            },
            y: 100,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
          });
        }
      }

      // How It Works Section
      if (howItWorksRef.current) {
        const terminals = howItWorksRef.current.querySelectorAll('.terminal-card');
        if (terminals.length) {
          gsap.from(terminals, {
            scrollTrigger: {
              trigger: howItWorksRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse"
            },
            scale: 0.8,
            autoAlpha: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.4)"
          });
        }
      }

      // CTA Section Animation
      if (ctaSectionRef.current) {
        gsap.from(ctaSectionRef.current, {
          scrollTrigger: {
            trigger: ctaSectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          },
          scale: 0.9,
          autoAlpha: 0,
          duration: 1,
          ease: "power3.out"
        });
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Magnetic button effect
  const handleMagneticHover = (e: React.MouseEvent<HTMLElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLElement>) => {
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.3)"
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <CustomCursor />
      {/* <ParticleBackground /> */}
      {/* Grid Background */}
      <div className="parallax-slow absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Spotlight Effect */}
        <Spotlight
          className="-top-100 left-0 md:left-95 md:-top-35"
          fill="white"
        />
        <nav ref={navRef} className="flex justify-between items-center mb-20 relative z-20">
          <div className="flex items-center gap-3">
            <div ref={logoRef} className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden border border-gray-700">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"></div>
              <svg
                className="w-6 h-6 text-gray-300 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-100">
              SoniFlow
            </span>
          </div>
          <div className="flex gap-8 items-center">
            <a
              href="#features"
              className="text-gray-400 hover:text-gray-200 transition"
              style={{ fontWeight: 500, fontStyle: 'normal' }}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-400 hover:text-gray-200 transition"
              style={{ fontWeight: 500, fontStyle: 'normal' }}
            >
              How It Works
            </a>
            <Link
              to="/app"
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg font-bold transition shadow-md border border-gray-700"
              onMouseMove={handleMagneticHover}
              onMouseLeave={handleMagneticLeave}
            >
              Launch App →
            </Link>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto text-center mt-28 relative z-20">
          <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-full mb-8">
            <svg
              className="w-4 h-4 text-gray-400 animate-spin"
              style={{ animationDuration: "3s" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
            </svg>
            <span className="text-sm text-gray-300 uppercase tracking-wider" style={{ fontWeight: 500, fontStyle: 'normal' }}>
              Autonomous DeFi Automation
            </span>
          </div>
          <h1 ref={h1Ref} className="text-7xl mb-6 leading-[1.1] tracking-tight">
            <span className="block text-gray-100" style={{ fontWeight: 800, fontStyle: 'normal' }}>
              Automate DeFi
            </span>
            <span className="block bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 bg-clip-text text-transparent" style={{ fontWeight: 700, fontStyle: 'italic' }}>
              Like Clockwork
            </span>
          </h1>
          <p ref={descRef} className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed" style={{ fontWeight: 400, fontStyle: 'normal' }}>
            Build automated strategies with precision-engineered nodes. Connect,
            simulate, execute. Powered by Lit Protocol, optimized by AI, built
            for reliability.
          </p>
          <div ref={ctaRef} className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="text-white transition shadow-lg inline-flex items-center gap-2"
                style={{
                  backgroundColor: '#1D2B3F',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  fontStyle: 'normal'
                }}
                onMouseMove={handleMagneticHover}
                onMouseLeave={handleMagneticLeave}
              >
                <span>Open Dashboard</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            ) : (
              <button
                onClick={redirectToVincentConnect}
                className="text-white transition shadow-lg inline-flex items-center gap-2"
                style={{
                  backgroundColor: '#1D2B3F',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  fontStyle: 'normal'
                }}
                onMouseMove={handleMagneticHover}
                onMouseLeave={handleMagneticLeave}
              >
                <span>Connect with Vincent</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            )}
            <a
              href="#how-it-works"
              className="transition inline-flex items-center gap-2"
              style={{
                backgroundColor: 'transparent',
                color: '#D0D0D0',
                border: '1px solid #3A475C',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '1.125rem',
                fontWeight: 500,
                fontStyle: 'normal'
              }}
              onMouseMove={handleMagneticHover}
              onMouseLeave={handleMagneticLeave}
            >
              <span>How It Works</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Feature Cards */}
        <div
          id="features"
          ref={featureCardsRef}
          className="grid md:grid-cols-3 gap-6 mt-32 max-w-6xl mx-auto"
        >
          <Terminal className="w-full max-w-full h-auto max-h-none">
            <TypingAnimation className="text-blue-400">&gt; node --inspect modular-system</TypingAnimation>
            <AnimatedSpan className="text-green-500">
              Debugger listening on ws://127.0.0.1
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              Module system initialized
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              Loaded: Swap Module v2.1.0
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              Loaded: Lending Module v1.8.2
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              Loaded: Transfer Module v3.0.1
            </AnimatedSpan>
            <AnimatedSpan className="text-cyan-400">
              <span>Status: All modules operational</span>
            </AnimatedSpan>
            <TypingAnimation className="text-gray-400">
              Precision-built modules ready for deployment.
            </TypingAnimation>
          </Terminal>

          <Terminal className="w-full max-w-full h-auto max-h-none">
            <TypingAnimation className="text-blue-400">&gt; security-audit --engine pkp</TypingAnimation>
            <AnimatedSpan className="text-green-500">
              Scanning execution environment...
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              PKP signature verification: PASSED
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              Custody check: ZERO custody detected
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              Private key control: USER OWNED
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              Trustless execution: VERIFIED
            </AnimatedSpan>
            <AnimatedSpan className="text-cyan-400">
              <span>Security Score: 10/10</span>
            </AnimatedSpan>
            <TypingAnimation className="text-gray-400">
              Your keys. Your automation. Total control.
            </TypingAnimation>
          </Terminal>

          <Terminal className="w-full max-w-full h-auto max-h-none">
            <TypingAnimation className="text-blue-400">&gt; ai-optimizer --market-watch</TypingAnimation>
            <AnimatedSpan className="text-green-500">
              Initializing market intelligence...
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              Real-time data streams: ACTIVE
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              Crash detection algorithms: ONLINE
            </AnimatedSpan>
            <AnimatedSpan className="text-green-500">
              Strategy adaptation engine: READY
            </AnimatedSpan>
            <AnimatedSpan className="text-yellow-500">
              <span>Monitoring 2,847 market signals</span>
            </AnimatedSpan>
            <AnimatedSpan className="text-cyan-400">
              <span>AI Status: Optimizing strategies</span>
            </AnimatedSpan>
            <TypingAnimation className="text-gray-400">
              Strategies that learn and adapt in real-time.
            </TypingAnimation>
          </Terminal>
        </div>

        {/* How It Works */}
        <div id="how-it-works" ref={howItWorksRef} className="mt-32 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-full mb-4">
              <span className="text-xs font-black text-gray-300 uppercase tracking-widest">
                The Process
              </span>
            </div>
            <h2 className="text-5xl font-black text-gray-100 tracking-tight">
              Precision Engineering
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Terminal className="terminal-card w-full max-w-full h-auto max-h-none">
              <TypingAnimation className="text-blue-400">&gt; workflow-builder init</TypingAnimation>
              <AnimatedSpan className="text-green-500">
                Canvas initialized
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                Node library loaded: 24 modules available
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                Drag-and-drop interface: READY
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                Connection validation: ACTIVE
              </AnimatedSpan>
              <AnimatedSpan className="text-cyan-400">
                <span>Status: Awaiting workflow assembly</span>
              </AnimatedSpan>
              <TypingAnimation className="text-gray-400">
                Visual, intuitive, powerful workflow creation.
              </TypingAnimation>
            </Terminal>

            <Terminal className="terminal-card w-full max-w-full h-auto max-h-none">
              <TypingAnimation className="text-blue-400">&gt; simulate --dry-run workflow.json</TypingAnimation>
              <AnimatedSpan className="text-green-500">
                Loading workflow configuration...
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                Checking gas estimates: CALCULATED
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                Verifying token approvals: CONFIRMED
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                Simulating execution paths: SUCCESS
              </AnimatedSpan>
              <AnimatedSpan className="text-cyan-400">
                <span>Estimated gas: 0.0023 ETH</span>
              </AnimatedSpan>
              <TypingAnimation className="text-gray-400">
                Test-drive complete. Ready for deployment.
              </TypingAnimation>
            </Terminal>

            <Terminal className="terminal-card w-full max-w-full h-auto max-h-none">
              <TypingAnimation className="text-blue-400">&gt; execute --pkp-sign workflow.json</TypingAnimation>
              <AnimatedSpan className="text-green-500">
                PKP signature requested...
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                Transaction signed: 0x7f8a9b...
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                Broadcast to network: CONFIRMED
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                Block confirmation: #18,942,573
              </AnimatedSpan>
              <AnimatedSpan className="text-cyan-400">
                <span>Status: Execution successful</span>
              </AnimatedSpan>
              <TypingAnimation className="text-gray-400">
                Transaction logged and auditable.
              </TypingAnimation>
            </Terminal>

            <Terminal className="terminal-card w-full max-w-full h-auto max-h-none">
              <TypingAnimation className="text-blue-400">&gt; ai-agent --monitor markets</TypingAnimation>
              <AnimatedSpan className="text-green-500">
                Deploying market surveillance agents...
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                Crash detection: ARMED
              </AnimatedSpan>
              <AnimatedSpan className="text-green-500">
                Re-entry signals: TRACKING
              </AnimatedSpan>
              <AnimatedSpan className="text-yellow-500">
                <span>Alert: Volatility spike detected at 09:47 UTC</span>
              </AnimatedSpan>
              <AnimatedSpan className="text-cyan-400">
                <span>Strategy adapted: Position protected</span>
              </AnimatedSpan>
              <TypingAnimation className="text-gray-400">
                24/7 adaptive monitoring on autopilot.
              </TypingAnimation>
            </Terminal>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div ref={ctaSectionRef} className="relative max-w-4xl mx-auto p-12 bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden">
            <div className="absolute top-4 right-4 w-32 h-32 bg-gray-700/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-4 w-40 h-40 bg-gray-600/20 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-6 animate-spin"
                style={{ animationDuration: "6s" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
              </svg>
              <h2 className="text-4xl font-black text-gray-100 mb-4 tracking-tight">
                Set Your DeFi in Motion
              </h2>
              <p className="text-lg text-gray-400 mb-8 font-medium max-w-2xl mx-auto">
                Join the automation revolution. Build once, execute forever.
              </p>
              <Link
                to="/app"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-xl font-black text-xl transition shadow-xl border-2 border-gray-700"
                onMouseMove={handleMagneticHover}
                onMouseLeave={handleMagneticLeave}
              >
                <span>Launch SomiFlow</span>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t-2 border-gray-800">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center shadow-sm border border-gray-700">
                <svg
                  className="w-5 h-5 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                </svg>
              </div>
              <span className="font-black text-gray-100">DeFlow</span>
            </div>
            {/* <div className="flex gap-8">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-200 transition font-bold"
              >
                Docs
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-200 transition font-bold"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-200 transition font-bold"
              >
                Discord
              </a>
            </div> */}
          </div>
          <div className="pt-8 border-t border-gray-800">
            <p className="text-center text-gray-500 font-medium text-sm">
              Powered by{" "}
              <span className="font-bold text-gray-400">Lit Protocol</span> ·{" "}
              <span className="font-bold text-gray-400">ASI Alliance</span> ·{" "}
              <span className="font-bold text-gray-400">Avail</span>
            </p>
            <p className="text-center text-gray-600 text-sm mt-3">
              Winner ETHOnline (Work in Progress)
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
