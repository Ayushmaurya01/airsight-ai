"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { GlassCard } from "@/components/ui/glass-card";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Flame,
  Droplet,
  Compass,
  MapPin,
  TrendingUp,
  Brain,
  Mic,
  Smartphone,
  CheckCircle,
  FileText,
  AlertTriangle,
  ChevronRight,
  Sun,
  Moon,
  Github,
  Globe,
  Award,
  Users
} from "lucide-react";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Monitor scroll for navbar styles
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cycle through workflow steps in the hero city animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "AI Scans Completed", value: "142,800+" },
    { label: "Community Members", value: "38,400+" },
    { label: "Avg. Resolution Time", value: "4.2 Hours" },
    { label: "Pollution Cleared", value: "1,240 Tons" },
  ];

  const features = [
    {
      icon: <Smartphone className="w-6 h-6 text-cyan-400" />,
      title: "Citizen Reporting",
      desc: "Instant reporting via photos, text or simple voice commands with auto GPS tagging."
    },
    {
      icon: <Brain className="w-6 h-6 text-emerald-400" />,
      title: "Gemini AI Vision",
      desc: "Automated analysis of uploaded photos to extract type, severity, and Priority Score."
    },
    {
      icon: <Compass className="w-6 h-6 text-blue-400" />,
      title: "Interactive Heatmaps",
      desc: "Live spatial visualization of reports grouped by severity and pollution types."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
      title: "Predictive Analytics",
      desc: "Gemini models predict local dispersion rates based on current wind and humidity."
    },
    {
      icon: <FileText className="w-6 h-6 text-amber-400" />,
      title: "Smart Resource Allocation",
      desc: "Automated cleanup suggestions including staff requirements, estimated time, and budget."
    },
    {
      icon: <Mic className="w-6 h-6 text-rose-400" />,
      title: "Voice Understanding",
      desc: "Speak naturally. Gemini extracts location details and summaries directly from audio."
    }
  ];

  const timelineSteps = [
    { title: "Upload", desc: "Citizen uploads image, text or voice", details: "GPS metadata is automatically captured." },
    { title: "Analyze", desc: "Gemini grades severity & validity", details: "Filters fake images and checks for duplicate reports." },
    { title: "Map & Predict", desc: "Interactive plotting & wind analysis", details: "Predicts path of toxic dispersion over 24h." },
    { title: "Recommend & Assign", desc: "AI calculates budget & logistics", details: "Creates resource allocation plans for city crews." },
    { title: "Resolve & Notify", desc: "Work completed & citizen updated", details: "Points & achievement badges awarded to citizens." }
  ];

  const testimonials = [
    {
      quote: "AirSight AI reduced our municipal response time from 5 days to under 6 hours. The Gemini priority score makes dispatching teams incredibly efficient.",
      author: "Robert Vance",
      role: "Director of Public Works, SF County",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    },
    {
      quote: "I reported an e-waste dump near my kids' school and had it resolved by the next afternoon. Seeing my report on the live map made me feel heard.",
      author: "Elena Rostova",
      role: "Community Organiser",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none" />

      {/* Floating grid elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* NAVBAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent py-6"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:rotate-6 transition-transform">
              <Brain className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="font-outfit text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                AirSight
              </span>
              <span className="font-outfit text-xl font-black text-cyan-400"> AI</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#technology" className="hover:text-white transition-colors">Technology</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#impact" className="hover:text-white transition-colors">Impact</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors border border-white/10"
              title="Toggle theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors border border-white/10 hidden sm:inline-flex"
            >
              <Github className="w-4 h-4" />
            </a>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-cyan-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 flex flex-col items-start text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-xs font-semibold text-cyan-400 mb-6 animate-pulse-slow">
            <ShieldAlert className="w-3.5 h-3.5" />
            Empowering Smart Municipal Response
          </div>

          <h1 className="font-outfit text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Detect Pollution. <br />
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Empower Communities.
            </span>
            <br />
            Build Cleaner Cities.
          </h1>

          <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-xl leading-relaxed">
            An AI-powered civic intelligence platform using Gemini AI to identify pollution hotspots, analyze severity, automate municipal responses, and create healthier community habitats.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <Link
              href="/login?role=citizen"
              className="px-8 py-4 rounded-2xl text-base font-semibold bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 text-center hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 group"
            >
              Report Pollution
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login?role=admin"
              className="px-8 py-4 rounded-2xl text-base font-semibold bg-slate-900 border border-white/10 hover:bg-slate-800 text-center hover:border-cyan-400/40 transition-all flex items-center justify-center gap-2"
            >
              Explore Dashboard
            </Link>
          </div>
        </div>

        {/* HERO ILLUSTRATION: ANIMATED FUTURE CITY */}
        <div className="lg:col-span-6 relative flex justify-center items-center h-[350px] sm:h-[450px] w-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-emerald-500/10 rounded-full blur-[80px]" />

          <div className="relative w-full h-full border border-white/5 rounded-3xl bg-slate-900/40 backdrop-blur-sm overflow-hidden flex flex-col justify-center items-center shadow-2xl">
            {/* Ticker / Feed simulation on top */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-slate-950/70 border border-white/5 px-4 py-2 rounded-xl text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                Live AI Pollution Feed
              </span>
              <span>SF Region Grid Active</span>
            </div>

            {/* Wireframe City Grid and Roads */}
            <svg viewBox="0 0 400 300" className="w-full h-full opacity-60">
              <defs>
                <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>
              {/* Roads / Connections */}
              <path d="M 50 150 L 350 150" stroke="url(#roadGrad)" strokeWidth="6" />
              <path d="M 200 50 L 200 250" stroke="url(#roadGrad)" strokeWidth="6" />
              <path d="M 100 80 L 300 220" stroke="url(#roadGrad)" strokeWidth="4" />

              {/* Green Park Circles */}
              <circle cx="120" cy="110" r="25" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="280" cy="180" r="30" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />

              {/* Pulsing Pollution Hotspot Markers */}
              <circle cx="100" cy="80" r="10" fill="#ef4444" className="pulse-marker" fillOpacity="0.4" />
              <circle cx="200" cy="150" r="8" fill="#f59e0b" className="pulse-marker" fillOpacity="0.4" />
              <circle cx="300" cy="220" r="12" fill="#ef4444" className="pulse-marker" fillOpacity="0.4" />

              {/* Grid nodes */}
              <circle cx="50" cy="150" r="3" fill="#38bdf8" />
              <circle cx="350" cy="150" r="3" fill="#38bdf8" />
              <circle cx="200" cy="50" r="3" fill="#38bdf8" />
              <circle cx="200" cy="250" r="3" fill="#38bdf8" />
            </svg>

            {/* FLOATING AI DATA CARDS */}
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div
                  key="card-1"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute bottom-6 left-6 right-6"
                >
                  <GlassCard hoverGlow={false} glowColor="cyan" className="p-4 bg-slate-950/80">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">Step 1: Detect</p>
                        <h4 className="text-xs font-bold text-white">Citizen Uploads Photo of Burn Site</h4>
                        <p className="text-[10px] text-slate-400">5th & Folsom St, SF • GeoTag active</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div
                  key="card-2"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute bottom-6 left-6 right-6"
                >
                  <GlassCard hoverGlow={false} glowColor="emerald" className="p-4 bg-slate-950/80">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Step 2: AI Analyze</p>
                        <h4 className="text-xs font-bold text-white">Gemini: High Severity Trash Fire</h4>
                        <p className="text-[10px] text-slate-400">Confidence: 96% • Priority Score: 91/100</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div
                  key="card-3"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute bottom-6 left-6 right-6"
                >
                  <GlassCard hoverGlow={false} glowColor="blue" className="p-4 bg-slate-950/80">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Step 3: AI Predict</p>
                        <h4 className="text-xs font-bold text-white">Wind blowing East towards Hospital</h4>
                        <p className="text-[10px] text-slate-400">Soot dispersal forecast: 2.3km spread</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeStep === 3 && (
                <motion.div
                  key="card-4"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute bottom-6 left-6 right-6"
                >
                  <GlassCard hoverGlow={false} glowColor="amber" className="p-4 bg-slate-950/80">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Step 4: AI Recommend</p>
                        <h4 className="text-xs font-bold text-white">Resource Plan Generated</h4>
                        <p className="text-[10px] text-slate-400">Req: 5 Workers, 4h containment • Budget: $850</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeStep === 4 && (
                <motion.div
                  key="card-5"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="absolute bottom-6 left-6 right-6"
                >
                  <GlassCard hoverGlow={false} glowColor="emerald" className="p-4 bg-slate-950/80">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Step 5: Resolve</p>
                        <h4 className="text-xs font-bold text-white">Task Resolved & Citizen Notified</h4>
                        <p className="text-[10px] text-slate-400">Status: Closed • Elena awarded 100 EcoPoints</p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="bg-slate-900/50 border-y border-white/5 py-12 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((st, i) => (
            <div key={i} className="text-center md:text-left flex flex-col items-center md:items-start">
              <span className="font-outfit text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                {st.value}
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                {st.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            A Complete AI Ecosystem for Civic Health
          </h2>
          <p className="text-slate-400">
            AirSight AI doesn't just categorize reports. It integrates community mapping, Gemini predictions, resources costing, and citizen rewards in one interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <GlassCard
              key={i}
              className="p-8 border-white/5"
              glowColor={
                i === 0 ? "cyan" :
                i === 1 ? "emerald" :
                i === 2 ? "blue" :
                i === 3 ? "blue" :
                i === 4 ? "amber" : "rose"
              }
              hoverGlow={true}
              delay={i * 0.05}
            >
              <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center mb-6 border border-white/10">
                {feat.icon}
              </div>
              <h3 className="font-outfit text-lg font-bold mb-3 text-white">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* WORKFLOW TIMELINE */}
      <section id="how-it-works" className="py-24 bg-slate-900/30 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              How It Works: The Platform Pipeline
            </h2>
            <p className="text-slate-400">
              The lifecycle of a single incident report from detection to full municipal resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-cyan-500/50 to-emerald-500/50 z-0" />

            {timelineSteps.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center font-outfit text-xl font-bold text-cyan-400 mb-6 shadow-lg shadow-cyan-500/10">
                  {i + 1}
                </div>
                <h3 className="font-outfit font-bold text-base mb-2">{step.title}</h3>
                <p className="text-xs text-slate-300 font-medium mb-1 max-w-[200px]">{step.desc}</p>
                <p className="text-[10px] text-slate-500 max-w-[180px]">{step.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMUNITY IMPACT & TESTIMONIALS */}
      <section id="impact" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Tested & Proven Civic Impact
          </h2>
          <p className="text-slate-400">
            Hear from city engineers, community leaders, and municipal dispatchers using our AI infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((test, i) => (
            <GlassCard key={i} className="p-8 border-white/5 flex flex-col justify-between" glowColor={i === 0 ? "emerald" : "cyan"} hoverGlow={true}>
              <p className="italic text-slate-300 text-sm leading-relaxed mb-6">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={test.avatar}
                  alt={test.author}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{test.author}</h4>
                  <p className="text-[10px] text-slate-400">{test.role}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <GlassCard className="p-12 border-cyan-500/20 bg-slate-900/40" glowColor="cyan" hoverGlow={true}>
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to Upgrade Your City's Air & Habitat?
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Deploy AirSight AI locally or explore our civic platform live. Standardized schemas ready for municipal database integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/login?role=citizen"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 hover:opacity-90 transition-all shadow-lg"
              >
                Join as Citizen
              </Link>
              <Link
                href="/login?role=admin"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-sm font-semibold bg-slate-950 border border-white/10 hover:border-cyan-400/40 transition-all text-white"
              >
                Admin Command
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-12 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center">
              <Brain className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-outfit text-sm font-bold tracking-tight">
              AirSight <span className="text-cyan-400 font-extrabold">AI</span>
            </span>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} AirSight AI. All rights reserved. Platform licensed for municipal use.
          </p>

          <div className="flex gap-6 text-xs text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="https://github.com" className="hover:text-white transition-colors flex items-center gap-1">
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
