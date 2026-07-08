"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { GlassCard } from "@/components/ui/glass-card";
import { db, Report, Prediction, Comment } from "@/lib/db";
import { aiService } from "@/lib/gemini";
import { formatTimeAgo } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  Brain,
  ShieldAlert,
  Flame,
  Droplet,
  Compass,
  MapPin,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Send,
  Download,
  AlertCircle
} from "lucide-react";

// Import Leaflet Map dynamically
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900/60 animate-pulse rounded-2xl flex items-center justify-center border border-white/5">
      <div className="text-slate-400 text-xs flex flex-col items-center gap-3">
        <Compass className="w-8 h-8 animate-spin text-emerald-400" />
        Loading Environmental Grid...
      </div>
    </div>
  ),
});

export default function AdminDashboard() {
  const router = useRouter();

  // Mounting checklist
  const [isMounted, setIsMounted] = useState(false);

  // Authentication States
  const [adminName, setAdminName] = useState("Sarah Jenkins");

  // Database lists
  const [reports, setReports] = useState<Report[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  // AI Prediction & Recommendation for selected report
  const [aiPred, setAiPred] = useState<Prediction | null>(null);
  const [aiPredLoading, setAiPredLoading] = useState(false);
  const [weatherText, setWeatherText] = useState("Wind: NW 14mph, Humidity: 78%, Clear Skies");

  // Comments for selected report
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Print/Report mode
  const [isPrinting, setIsPrinting] = useState(false);

  // Load Admin auth session
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("user_role");
      const storedName = localStorage.getItem("user_name");

      if (storedRole !== "admin") {
        router.push("/login?role=admin");
        return;
      }
      if (storedName) setAdminName(storedName);
    }
  }, [router]);

  // Load database lists
  const loadDatabaseData = async () => {
    const list = await db.getReports();
    setReports(list);

    const statsObj = await db.getStats();
    setDbStats(statsObj);

    if (list.length > 0 && !selectedReport) {
      handleSelectReport(list[0]);
    } else if (selectedReport) {
      // Refresh current selection
      const updated = list.find((r) => r.id === selectedReport.id);
      if (updated) setSelectedReport(updated);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const handleSelectReport = async (rep: Report) => {
    setSelectedReport(rep);
    setAiPredLoading(true);
    
    try {
      // Fetch predictions from db/mock
      const pred = await db.getPredictionsForReport(rep.id);
      setAiPred(pred);

      // Fetch comments
      const commList = await db.getComments(rep.id);
      setComments(commList);
    } catch (e) {
      console.error(e);
    } finally {
      setAiPredLoading(false);
    }
  };

  // Re-generate predictions using Gemini
  const handleRegenerateAI = async () => {
    if (!selectedReport) return;
    setAiPredLoading(true);
    try {
      const gPred = await aiService.getPredictions(selectedReport.pollution_type, selectedReport.severity, weatherText);
      const gRec = await aiService.getRecommendations(selectedReport.pollution_type, selectedReport.severity);

      const updatedPred = await db.addPrediction({
        report_id: selectedReport.id,
        trend_24h: gPred.trend_24h,
        trend_3d: gPred.trend_3d,
        weather_impact: gPred.weather_impact,
        clean_suggestions: gRec.clean_suggestions,
        estimated_workers: gRec.estimated_workers,
        estimated_time: gRec.estimated_time,
        budget_estimate: gRec.budget_estimate,
        emergency_level: gRec.emergency_level,
      });
      setAiPred(updatedPred);
    } catch (err) {
      console.error("Gemini failed to re-analyze: ", err);
    } finally {
      setAiPredLoading(false);
    }
  };

  // Status workflow actions
  const handleUpdateStatus = async (status: Report["status"]) => {
    if (!selectedReport) return;
    const updated = await db.updateReportStatus(selectedReport.id, status);
    if (updated) {
      setSelectedReport(updated);
      loadDatabaseData();
    }
  };

  // Add Inspector Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !newComment.trim()) return;

    setCommentLoading(true);
    try {
      const comm = await db.addComment({
        report_id: selectedReport.id,
        author_id: "user-admin",
        content: newComment,
      });
      setComments((prev) => [...prev, comm]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const handlePrint = () => {
    window.print();
  };

  // Filters application
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.pollution_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || r.pollution_type.toLowerCase().includes(filterType.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || r.severity === filterSeverity;
    return matchesSearch && matchesType && matchesSeverity;
  });

  const COLORS = ["#10b981", "#f59e0b", "#f97316", "#ef4444"];
  const pieData = dbStats
    ? [
        { name: "Low", value: dbStats.severityBreakdown.Low },
        { name: "Medium", value: dbStats.severityBreakdown.Medium },
        { name: "High", value: dbStats.severityBreakdown.High },
        { name: "Critical", value: dbStats.severityBreakdown.Critical }
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Background radial overlays */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-emerald-900/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] rounded-full bg-cyan-900/5 blur-[130px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-[1050] bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4 px-6 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center">
            <Brain className="w-5.5 h-5.5 text-slate-950" />
          </div>
          <div>
            <span className="font-outfit text-lg font-bold tracking-tight">AirSight</span>
            <span className="text-emerald-400 font-black"> AI</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold ml-3 border-l border-white/10 pl-3">
              Municipal Control
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span>Inspector: {adminName}</span>
          </div>

          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white flex items-center gap-2 text-xs font-bold"
            title="Download PDF Report"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Print Report</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 transition-colors text-slate-400 hover:text-red-400"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 print:p-0">
        
        {/* STATS METRIC GRID */}
        {dbStats && (
          <section className="lg:col-span-12 grid grid-cols-2 md:grid-cols-5 gap-4 print:grid-cols-5">
            <GlassCard hoverGlow={true} glowColor="blue" className="p-4 border-white/5 bg-slate-900/10">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Total Reports</span>
              <span className="font-outfit text-2xl font-black text-white block">{dbStats.total}</span>
            </GlassCard>
            <GlassCard hoverGlow={true} glowColor="emerald" className="p-4 border-white/5 bg-slate-900/10">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Resolved Cases</span>
              <span className="font-outfit text-2xl font-black text-emerald-400 block">{dbStats.resolved}</span>
            </GlassCard>
            <GlassCard hoverGlow={true} glowColor="amber" className="p-4 border-white/5 bg-slate-900/10">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Pending Action</span>
              <span className="font-outfit text-2xl font-black text-amber-400 block">{dbStats.pending}</span>
            </GlassCard>
            <GlassCard hoverGlow={true} glowColor="rose" className="p-4 border-white/5 bg-slate-900/10">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Critical Hotspots</span>
              <span className="font-outfit text-2xl font-black text-red-500 block">{dbStats.critical}</span>
            </GlassCard>
            <GlassCard hoverGlow={true} glowColor="cyan" className="p-4 border-white/5 bg-slate-900/10">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Scanned Today</span>
              <span className="font-outfit text-2xl font-black text-cyan-400 block">{dbStats.today}</span>
            </GlassCard>
          </section>
        )}

        {/* COLUMN 1: REPORTS LISTING PANEL */}
        <section className="lg:col-span-4 flex flex-col gap-5 print:hidden">
          <GlassCard className="p-5 border-white/5 flex flex-col gap-4 max-h-[750px]" hoverGlow={false}>
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-outfit font-extrabold text-sm uppercase tracking-wider text-slate-200">Incident Feed</h3>
              <button
                onClick={loadDatabaseData}
                className="p-1.5 rounded-lg bg-slate-950 border border-white/5 hover:bg-slate-900 transition-colors text-slate-400 hover:text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search incidents, tags..."
                  className="w-full bg-slate-950/60 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-emerald-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-slate-950/60 border border-white/5 rounded-xl py-2 px-2 text-slate-300 focus:outline-none"
                >
                  <option value="all">Severity: All</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-950/60 border border-white/5 rounded-xl py-2 px-2 text-slate-300 focus:outline-none"
                >
                  <option value="all">Type: All</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Air">Air</option>
                  <option value="E-Waste">E-Waste</option>
                  <option value="Solid Waste">Trash</option>
                </select>
              </div>
            </div>

            {/* Reports scroll container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth">
              {filteredReports.length === 0 ? (
                <p className="text-slate-500 text-center py-12 text-xs">No reports match your filters.</p>
              ) : (
                filteredReports.map((rep) => {
                  const severityColors: Record<string, string> = {
                    Low: "text-emerald-400 bg-emerald-500/10",
                    Medium: "text-amber-400 bg-amber-500/10",
                    High: "text-orange-400 bg-orange-500/10",
                    Critical: "text-red-400 bg-red-500/10",
                  };
                  return (
                    <div
                      key={rep.id}
                      onClick={() => handleSelectReport(rep)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-300 hover:translate-y-[-2px] hover:scale-[1.01] hover:border-emerald-500/30 blur-glassy ${
                        selectedReport?.id === rep.id
                          ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                          : "bg-slate-950/40 border-white/5 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3 mb-1">
                        <span className="font-bold text-xs text-white leading-snug line-clamp-1">{rep.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide shrink-0 ${severityColors[rep.severity]}`}>
                          {rep.severity}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mb-2.5">{rep.description}</p>
                      
                      <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold border-t border-white/5 pt-2.5">
                        <span className="text-cyan-400">Score: {rep.priority_score}/100</span>
                        <span>{formatTimeAgo(rep.created_at)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </section>

        {/* COLUMN 2: INCIDENT MAP & ANALYTICS CHARTS */}
        <section className="lg:col-span-8 flex flex-col gap-6 print:col-span-12">
          
          {/* MAP */}
          <div className="h-[320px] print:hidden">
            <InteractiveMap
              mode="viewer"
              reports={filteredReports}
              selectedLocation={selectedReport ? [selectedReport.latitude, selectedReport.longitude] : undefined}
            />
          </div>

          {/* TAB CONTENT: ACTION DETAILS & AI RECOMMENDATIONS */}
          {selectedReport && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 print:grid-cols-12">
              
              <GlassCard
                className="p-6 border-white/5 md:col-span-7 print:col-span-6"
                hoverGlow={true}
                glowColor={
                  selectedReport.severity === "Critical" ? "rose" :
                  selectedReport.severity === "High" ? "amber" :
                  selectedReport.severity === "Medium" ? "blue" : "emerald"
                }
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Selected Case Summary</span>
                    <h3 className="font-outfit font-extrabold text-base text-white">{selectedReport.title}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase ${
                    selectedReport.status === "Resolved"
                      ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                      : selectedReport.status === "Assigned"
                      ? "bg-blue-500/20 border border-blue-500/30 text-blue-400"
                      : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                  }`}>
                    {selectedReport.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs">
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Reporter details</span>
                    <strong className="text-slate-300">{selectedReport.citizen_name || "Elena Rostova"}</strong>
                  </div>
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Priority Score</span>
                    <strong className="text-emerald-400">{selectedReport.priority_score} / 100</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6 bg-slate-950/30 p-4 rounded-xl border border-white/5">
                  {selectedReport.description}
                </p>

                {/* Workflow state controllers */}
                <div className="border-t border-white/5 pt-5 print:hidden">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-3">Update Dispatch Workflow</span>
                  <div className="flex gap-2.5 flex-wrap">
                    <button
                      onClick={() => handleUpdateStatus("Under Review")}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-xs font-bold text-slate-300"
                    >
                      Under Review
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("Verified")}
                      className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-xs font-bold text-slate-300"
                    >
                      Verify Report
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("Assigned")}
                      className="px-3 py-2 rounded-xl bg-blue-500 text-slate-950 text-xs font-extrabold hover:opacity-90"
                    >
                      Dispatch Crew
                    </button>
                    <button
                      onClick={() => handleUpdateStatus("Resolved")}
                      className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold hover:opacity-90"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </GlassCard>

              {/* Gemini Analytics & Resource predictions Card */}
              <GlassCard className="p-6 border-white/5 md:col-span-5 print:col-span-6 flex flex-col justify-between" hoverGlow={true} glowColor="emerald">
                <div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                    <span className="font-outfit font-extrabold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Brain className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
                      Gemini Dispatch Plan
                    </span>
                    <button
                      onClick={handleRegenerateAI}
                      disabled={aiPredLoading}
                      className="p-1 bg-slate-950 border border-white/5 rounded-lg text-[9px] font-bold text-slate-400 hover:text-white flex items-center gap-1 shrink-0"
                    >
                      <RefreshCw className={`w-3 h-3 ${aiPredLoading ? "animate-spin" : ""}`} />
                      Re-Analyze
                    </button>
                  </div>

                  {aiPredLoading ? (
                    <div className="space-y-4 py-8 text-center text-xs text-slate-500">
                      <div className="w-8 h-8 border border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      Recalculating weather shifts & resource costs...
                    </div>
                  ) : aiPred ? (
                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">24h Plume Trend</span>
                        <p className="text-slate-300 leading-snug">{aiPred.trend_24h}</p>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Logistics & Resources</span>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div className="bg-slate-950/40 p-2 rounded border border-white/5">
                            <span className="text-[8px] text-slate-500 block">Workers req.</span>
                            <strong className="text-slate-300">{aiPred.estimated_workers} crew</strong>
                          </div>
                          <div className="bg-slate-950/40 p-2 rounded border border-white/5">
                            <span className="text-[8px] text-slate-500 block">Est. Duration</span>
                            <strong className="text-slate-300">{aiPred.estimated_time}</strong>
                          </div>
                          <div className="bg-slate-950/40 p-2 rounded border border-white/5">
                            <span className="text-[8px] text-slate-500 block">Est. Cost</span>
                            <strong className="text-emerald-400">${aiPred.budget_estimate}</strong>
                          </div>
                          <div className="bg-slate-950/40 p-2 rounded border border-white/5">
                            <span className="text-[8px] text-slate-500 block">Hazard Level</span>
                            <strong className="text-red-400">{aiPred.emergency_level}</strong>
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-1">AI Action Plan</span>
                        <ul className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-white/5 list-disc list-inside text-slate-400">
                          {aiPred.clean_suggestions && aiPred.clean_suggestions.map((s, idx) => (
                            <li key={idx} className="line-clamp-2">{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-12 text-xs">No dispatch metrics found. Click Re-Analyze.</p>
                  )}
                </div>
              </GlassCard>
            </div>
          )}

          {/* CHARTS & ANALYTICS MODULES */}
          {isMounted && dbStats && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 print:grid-cols-12 print:break-before-page">
              
              {/* Monthly Severity area chart */}
              <GlassCard className="p-6 border-white/5 md:col-span-8 print:col-span-8" hoverGlow={true} glowColor="blue">
                <span className="font-outfit font-extrabold text-xs uppercase tracking-wider text-slate-400 block mb-4">Pollution Incidence Frequency Trends</span>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dbStats.monthlyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} />
                      <YAxis stroke="#475569" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", fontSize: 11 }} />
                      <Area type="monotone" dataKey="reports" stroke="#10b981" fillOpacity={1} fill="url(#colorReports)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Severity Pie Chart */}
              <GlassCard className="p-6 border-white/5 md:col-span-4 print:col-span-4 flex flex-col justify-between" hoverGlow={true} glowColor="cyan">
                <div>
                  <span className="font-outfit font-extrabold text-xs uppercase tracking-wider text-slate-400 block mb-4">Severity Ratios</span>
                  <div className="h-44 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "rgba(255,255,255,0.1)", fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-wide border-t border-white/5 pt-3.5">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/> Low</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/> Med</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block"/> High</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/> Crit</div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* INSPECTOR COMMENTS CORNER */}
          {selectedReport && (
            <GlassCard className="p-6 border-white/5 print:hidden" hoverGlow={true} glowColor="emerald">
              <span className="font-outfit font-extrabold text-xs uppercase tracking-wider text-slate-400 block mb-4">Audited Comments & Dispatch Log</span>
              
              <div className="space-y-3.5 mb-5 max-h-48 overflow-y-auto text-xs pr-2">
                {comments.length === 0 ? (
                  <p className="text-slate-500 text-center py-4 italic">No dispatcher comments yet.</p>
                ) : (
                  comments.map((comm) => (
                    <div key={comm.id} className="bg-slate-950/40 p-3.5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 mb-1.5">
                        <img src={comm.avatar_url} alt={comm.author_name} className="w-5 h-5 rounded-full object-cover border border-white/10" />
                        <strong className="text-slate-200 text-[10px]">{comm.author_name}</strong>
                        <span className="text-[8px] text-slate-500 ml-auto">{formatTimeAgo(comm.created_at)}</span>
                      </div>
                      <p className="text-slate-400 leading-normal">{comm.content}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add logistics logs or dispatcher notes..."
                  className="flex-1 bg-slate-950/60 border border-white/5 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/40"
                />
                <button
                  type="submit"
                  disabled={commentLoading}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </GlassCard>
          )}

        </section>
      </main>

      {/* PRINT-ONLY METADATA COVER */}
      <div className="hidden print:block text-slate-900 p-8 font-sans max-w-4xl mx-auto">
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">AirSight AI Platform Report</h1>
            <p className="text-sm font-semibold text-slate-600">Generated on {new Date().toLocaleDateString()} • City Inspector logs</p>
          </div>
          <span className="text-2xl font-black">AirSight <span className="text-emerald-600">AI</span></span>
        </div>
        
        {selectedReport && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-slate-300 pb-2">Active Case Audit: {selectedReport.title}</h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><strong>Status:</strong> {selectedReport.status}</div>
              <div><strong>Severity:</strong> {selectedReport.severity}</div>
              <div><strong>Priority Rating:</strong> {selectedReport.priority_score}/100</div>
              <div><strong>Coordinates:</strong> {selectedReport.latitude}, {selectedReport.longitude}</div>
              <div className="col-span-2"><strong>Location address:</strong> {selectedReport.address}</div>
            </div>
            
            <div className="text-sm leading-relaxed p-4 bg-slate-100 rounded-lg">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Citizen Complaint Notes</h3>
              {selectedReport.description}
            </div>

            {aiPred && (
              <div className="border border-slate-300 p-4 rounded-lg text-xs space-y-3">
                <h3 className="font-bold text-sm uppercase text-emerald-800">Gemini AI Municipal Action Plan</h3>
                <p><strong>24 Hour Plume forecast:</strong> {aiPred.trend_24h}</p>
                <p><strong>3 Day Plume forecast:</strong> {aiPred.trend_3d}</p>
                <p><strong>Cleanup Budget estimate:</strong> ${aiPred.budget_estimate}</p>
                <p><strong>Workers required:</strong> {aiPred.estimated_workers} staff</p>
                <p><strong>Clean suggestions:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {aiPred.clean_suggestions && aiPred.clean_suggestions.map((s, idx) => <li key={idx}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
