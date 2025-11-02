import { Link } from "react-router-dom";
import { redirectToVincentConnect } from "../lib/vincentAuth";
import { useAuth } from "../contexts/AuthContext";
import { Spotlight } from "../components/ui/spotlight";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Spotlight Effect */}
        <Spotlight
          className="-top-60 -left-20 md:-left-40 md:-top-40"
          fill="white"
        />
        <nav className="flex justify-between items-center mb-20 relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center shadow-md relative overflow-hidden border border-gray-700">
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
            <span
              className="text-2xl font-black tracking-tight text-gray-100"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              SoniFlow
            </span>
          </div>
          <div className="flex gap-8 items-center">
            <a
              href="#features"
              className="text-gray-400 hover:text-gray-200 transition font-medium"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-400 hover:text-gray-200 transition font-medium"
            >
              How It Works
            </a>
            <Link
              to="/app"
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg font-bold transition shadow-md border border-gray-700"
            >
              Launch App →
            </Link>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto text-center mt-28 relative z-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-full mb-8">
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
            <span className="text-sm font-bold text-gray-300 uppercase tracking-wider">
              Autonomous DeFi Automation
            </span>
          </div>
          <h1
            className="text-7xl font-black mb-6 text-gray-100 leading-[1.1] tracking-tight"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            Automate DeFi
            <br />
            <span className="bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 bg-clip-text text-transparent">
              Like Clockwork
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Build automated strategies with precision-engineered nodes. Connect,
            simulate, execute. Powered by Lit Protocol, optimized by AI, built
            for reliability.
          </p>
          <div className="flex gap-4 justify-center">
            {isAuthenticated ? (
              <Link
                to="/app"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg font-bold text-lg transition shadow-lg border border-gray-700 inline-flex items-center gap-2"
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
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg font-bold text-lg transition shadow-lg border border-gray-700 inline-flex items-center gap-2"
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
              className="px-8 py-4 bg-[#1a1a1a] hover:bg-[#222] text-gray-200 rounded-lg font-bold text-lg transition border-2 border-gray-700 shadow-sm inline-flex items-center gap-2"
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
          className="grid md:grid-cols-3 gap-6 mt-32 max-w-6xl mx-auto"
        >
          <div className="p-8 bg-[#1a1a1a] border-2 border-gray-800 rounded-xl hover:border-gray-600 hover:shadow-xl transition group">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center mb-4 border border-gray-700 group-hover:scale-110 transition">
              <svg
                className="w-7 h-7 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-100 mb-3 tracking-tight">
              Modular Nodes
            </h3>
            <p className="text-gray-400 leading-relaxed font-medium">
              Snap together precision-built modules. Swap, lend, transfer—each
              node engineered for reliability.
            </p>
          </div>

          <div className="p-8 bg-[#1a1a1a] border-2 border-gray-800 rounded-xl hover:border-gray-600 hover:shadow-xl transition group">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center mb-4 border border-gray-700 group-hover:scale-110 transition">
              <svg
                className="w-7 h-7 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-100 mb-3 tracking-tight">
              Trustless Engine
            </h3>
            <p className="text-gray-400 leading-relaxed font-medium">
              PKP-powered execution. Zero custody, total control. Your keys,
              your automation.
            </p>
          </div>

          <div className="p-8 bg-[#1a1a1a] border-2 border-gray-800 rounded-xl hover:border-gray-600 hover:shadow-xl transition group">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center mb-4 border border-gray-700 group-hover:scale-110 transition">
              <svg
                className="w-7 h-7 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-100 mb-3 tracking-tight">
              AI Optimization
            </h3>
            <p className="text-gray-400 leading-relaxed font-medium">
              Real-time market intelligence. Automated crash detection.
              Strategies that adapt.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="mt-32 max-w-5xl mx-auto">
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
            <div className="relative p-8 bg-[#1a1a1a] border-2 border-gray-800 rounded-xl hover:border-gray-600 transition group">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-gray-200 font-black text-xl shadow-lg border-2 border-gray-900">
                1
              </div>
              <h3 className="text-2xl font-black text-gray-100 mb-3 mt-2 tracking-tight">
                Build
              </h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                Drag, drop, connect. Assemble your automation workflow with
                precision-tooled nodes. Visual, intuitive, powerful.
              </p>
            </div>

            <div className="relative p-8 bg-[#1a1a1a] border-2 border-gray-800 rounded-xl hover:border-gray-600 transition group">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-gray-200 font-black text-xl shadow-lg border-2 border-gray-900">
                2
              </div>
              <h3 className="text-2xl font-black text-gray-100 mb-3 mt-2 tracking-tight">
                Simulate
              </h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                Test-drive before deployment. Dry-run simulation checks every
                detail—gas, approvals, outcomes.
              </p>
            </div>

            <div className="relative p-8 bg-[#1a1a1a] border-2 border-gray-800 rounded-xl hover:border-gray-600 transition group">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-gray-200 font-black text-xl shadow-lg border-2 border-gray-900">
                3
              </div>
              <h3 className="text-2xl font-black text-gray-100 mb-3 mt-2 tracking-tight">
                Execute
              </h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                PKP-powered trustless execution. Sign once, automate forever.
                Every transaction logged, auditable, yours.
              </p>
            </div>

            <div className="relative p-8 bg-[#1a1a1a] border-2 border-gray-800 rounded-xl hover:border-gray-600 transition group">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center text-gray-200 font-black text-xl shadow-lg border-2 border-gray-900">
                4
              </div>
              <h3 className="text-2xl font-black text-gray-100 mb-3 mt-2 tracking-tight">
                Monitor
              </h3>
              <p className="text-gray-400 leading-relaxed font-medium">
                AI agents watch the markets 24/7. Crash protection, re-entry
                signals, adaptive strategies on autopilot.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="relative max-w-4xl mx-auto p-12 bg-gradient-to-br from-gray-900 via-[#1a1a1a] to-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden">
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
