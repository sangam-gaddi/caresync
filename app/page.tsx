"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Activity, Stethoscope, Brain, Shield, Zap, ArrowRight, Heart,
  ChevronDown, Lock, Loader2, Mail, LogIn
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FEATURES = [
  { icon: <Activity className="w-6 h-6" />, title: "3D Health Avatar", desc: "See your body's health in real-time 3D. Organs change color based on your actual health data.", color: "from-cyan-400 to-blue-500" },
  { icon: <Stethoscope className="w-6 h-6" />, title: "AI Doctor (ARIA)", desc: "Talk to Dr. ARIA via voice or text. Get diagnosis, recommendations, and real-time health updates.", color: "from-purple-400 to-pink-500" },
  { icon: <Brain className="w-6 h-6" />, title: "Smart Insights", desc: "AI analyzes your lifestyle and health patterns to provide personalized health optimization plans.", color: "from-amber-400 to-orange-500" },
  { icon: <Shield className="w-6 h-6" />, title: "HIPAA Compliant", desc: "Your health data is fully encrypted, secured, and compliant with all healthcare privacy regulations.", color: "from-green-400 to-emerald-500" },
  { icon: <Zap className="w-6 h-6" />, title: "Real-Time Updates", desc: "Dynamic Island notifications keep you informed of health alerts, AI insights, and appointments.", color: "from-yellow-400 to-amber-500" },
  { icon: <Heart className="w-6 h-6" />, title: "Gamified Health", desc: "Turn improving your health into a game. Watch your score rise as you adopt better habits.", color: "from-rose-400 to-red-500" },
];

export default function LandingPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Login failed");
        return;
      }
      if (data.redirect) {
        router.push(data.redirect);
      }
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Hero entrance
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 80, skewY: 3 },
      { opacity: 1, y: 0, skewY: 0, duration: 1, ease: "expo.out" }
    )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.5"
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.5)" },
        "-=0.3"
      );

    // Feature cards scroll-trigger
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.fromTo(
        card,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          delay: i * 0.1,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Cleanup
    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 os-glass border-b border-[#1e2a3a]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-base font-black text-white">HealthOS</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/50">
          {["Features", "About", "Security"].map((item) => (
            <span key={item} className="hover:text-white cursor-pointer transition-colors">{item}</span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              document.querySelector('#login-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#1e2a3a] text-white/60 text-sm font-medium hover:text-white hover:border-white/20 transition-all"
          >
            <LogIn className="w-3.5 h-3.5" /> Login
          </button>
          <button
            onClick={() => router.push("/onboarding")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all"
          >
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20"
      >
        {/* Animated background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] bg-cyan-500/10 animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] bg-purple-500/10 animate-pulse-slow pointer-events-none" style={{ animationDelay: "1s" }} />

        {/* Grid */}
        <div className="absolute inset-0 bg-os-grid opacity-25 pointer-events-none" />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs text-cyan-300 font-medium">AI-Powered Healthcare OS</span>
        </motion.div>

        {/* Headline */}
        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl font-black leading-tight mb-6 opacity-0"
          style={{ letterSpacing: "-0.03em" }}
        >
          <span className="text-white">Your Health.</span>
          <br />
          <span className="text-gradient-health">Visualized.</span>
          <br />
          <span className="text-white">Optimized.</span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-base md:text-lg text-white/50 max-w-xl mb-10 leading-relaxed opacity-0"
        >
          The world&apos;s first Healthcare Operating System — a macOS-inspired interface with a
          real-time 3D body avatar, AI doctor, and gamified health scores.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 items-center opacity-0">
          <button
            onClick={() => router.push("/onboarding")}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_30px_rgba(0,229,255,0.2)] hover:shadow-[0_0_50px_rgba(0,229,255,0.35)] hover:scale-105 active:scale-95"
          >
            <Activity className="w-5 h-5" />
            Launch HealthOS
          </button>
          <button
            onClick={() => router.push("/os")}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-[#1e2a3a] text-white/70 font-medium text-base hover:border-white/20 hover:text-white transition-all"
          >
            Try Demo <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-[10px] text-white/25 font-mono">SCROLL</span>
          <ChevronDown className="w-4 h-4 text-white/25" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          {[
            { value: "100k+", label: "Patients Tracked" },
            { value: "< 1s", label: "AI Response Time" },
            { value: "99.9%", label: "Uptime SLA" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-2xl os-glass">
              <div className="text-2xl font-black text-gradient-health">{stat.value}</div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
              Everything you need to{" "}
              <span className="text-gradient-health">own your health</span>
            </h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">
              Built for the next generation of healthcare — immersive, intelligent, and intuitive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="group p-5 rounded-2xl os-glass hover:border-white/10 transition-all duration-300 cursor-default"
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-[13px] text-white/45 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login + CTA Bottom */}
      <section id="login-section" className="py-20 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Card */}
          <div className="p-6 rounded-3xl os-glass relative overflow-hidden">
            <div className="absolute inset-0 bg-glow-radial pointer-events-none opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <LogIn className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Welcome Back</h2>
                  <p className="text-[11px] text-white/40">Login to your HealthOS account</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Email Address"
                    required
                    className="w-full bg-[#0d1421] border border-[#1e2a3a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full bg-[#0d1421] border border-[#1e2a3a] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder-white/30 outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>

                {loginError && (
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-xs text-red-400">{loginError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading || !loginEmail || !loginPassword}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-sm hover:from-purple-400 hover:to-indigo-500 transition-all shadow-[0_0_30px_rgba(147,51,234,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</>
                  ) : (
                    <><LogIn className="w-4 h-4" /> Login</>
                  )}
                </button>
              </form>

              <div className="mt-3 text-center">
                <p className="text-[11px] text-white/30">
                  Don&apos;t have an account?{" "}
                  <span
                    onClick={() => router.push("/onboarding")}
                    className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium"
                  >
                    Sign up
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Sign Up / CTA Card */}
          <div className="p-6 rounded-3xl os-glass relative overflow-hidden">
            <div className="absolute inset-0 bg-glow-radial pointer-events-none" />
            <div className="relative flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 animate-float">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-lg font-black text-white mb-2">
                  New to HealthOS?
                </h2>
                <p className="text-white/40 text-sm mb-4">
                  Create your account in 2 minutes. Get a 3D health avatar, AI doctor access, and personalized health scores.
                </p>
                <div className="space-y-2 mb-5">
                  {[
                    "3D body avatar with organ health",
                    "AI Doctor (Dr. ARIA) consultations",
                    "Personalized health score tracking",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-xs text-white/50">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => router.push("/onboarding")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:from-cyan-400 hover:to-blue-400 transition-all shadow-[0_0_40px_rgba(0,229,255,0.2)] flex items-center justify-center gap-2"
              >
                <Activity className="w-4 h-4" /> Create Your Health Profile →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-[#1e2a3a] text-center">
        <p className="text-xs text-white/20 font-mono">
          © 2026 HealthOS · Built with Next.js, Three.js, GSAP, MongoDB
        </p>
      </footer>
    </div>
  );
}
