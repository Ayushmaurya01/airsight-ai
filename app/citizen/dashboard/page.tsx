"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { GlassCard } from "@/components/ui/glass-card";
import { db, Report, Notification, Profile } from "@/lib/db";
import { aiService, AIImageAnalysis } from "@/lib/gemini";
import { formatTimeAgo } from "@/lib/utils";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Upload,
  Mic,
  MapPin,
  FileText,
  Bell,
  Award,
  LogOut,
  Send,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Map as MapIcon,
  Trash2,
  Lock,
  Grid
} from "lucide-react";

// Import Leaflet Map dynamically with SSR disabled to prevent Node building failures
const InteractiveMap = dynamic(() => import("@/components/InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900/60 animate-pulse rounded-2xl flex items-center justify-center border border-white/5">
      <div className="text-slate-400 text-xs flex flex-col items-center gap-3">
        <MapIcon className="w-8 h-8 animate-bounce text-cyan-400" />
        Loading Environmental Grid...
      </div>
    </div>
  ),
});

export default function CitizenDashboard() {
  const router = useRouter();

  // Authentication & Profile States
  const [userName, setUserName] = useState("Elena Rostova");
  const [userId, setUserId] = useState("user-1");
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<{ file?: File; preview: string }[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [pollutionType, setPollutionType] = useState("General Solid Waste");
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // UI States
  const [activeTab, setActiveTab] = useState<"report" | "history" | "leaderboard">("report");
  const [reports, setReports] = useState<Report[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState<any>({ total: 0, resolved: 0, pending: 0 });
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);

  // AI assistant states
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "model"; parts: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Analysis / Loading modal state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<string[]>([]);
  const [aiReportResult, setAiReportResult] = useState<AIImageAnalysis | null>(null);

  // Load Session details & Database
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("user_role");
      const storedName = localStorage.getItem("user_name");
      const storedId = localStorage.getItem("user_id");

      if (storedRole !== "citizen") {
        router.push("/login?role=citizen");
        return;
      }
      if (storedName) setUserName(storedName);
      if (storedId) setUserId(storedId);
    }
  }, [router]);

  // Load Data from Database wrapper
  const loadDatabaseData = async () => {
    const list = await db.getReports();
    // Filter user's own reports
    const myReports = list.filter((r) => r.citizen_id === userId);
    setReports(myReports);

    const notifs = await db.getNotifications(userId);
    setNotifications(notifs);

    const prof = await db.getProfile(userId);
    if (prof) setUserProfile(prof);

    const leaderList = await db.getProfiles();
    const sortedLeader = [...leaderList].sort((a, b) => b.points - a.points);
    setLeaderboard(sortedLeader);

    const totalStats = await db.getStats();
    setStats({
      total: myReports.length,
      resolved: myReports.filter((r) => r.status === "Resolved").length,
      pending: myReports.filter((r) => r.status !== "Resolved").length,
    });
  };

  useEffect(() => {
    if (userId) {
      loadDatabaseData();
    }
  }, [userId]);

  // Setup Web Speech API for voice reporting
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsRecording(true);
          setVoiceTranscript("Listening...");
        };

        rec.onresult = async (e: any) => {
          const text = e.results[0][0].transcript;
          setVoiceTranscript(text);
          setDescription((prev) => (prev ? prev + " " + text : text));
          setIsRecording(false);

          // Prompt AI to extract information from spoken text
          try {
            const parsed = await aiService.analyzeVoiceText(text);
            if (parsed) {
              if (parsed.location && parsed.location !== "Unknown/General") {
                setAddress((prev) => prev || parsed.location);
              }
              if (parsed.pollution_type) {
                setPollutionType(parsed.pollution_type);
              }
              setTitle(parsed.summary || `Report: ${parsed.pollution_type}`);
            }
          } catch (err) {
            console.error("Voice parse error: ", err);
          }
        };

        rec.onerror = () => {
          setIsRecording(false);
          setVoiceTranscript("Error: Audio could not be captured.");
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleVoiceRecord = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition API is not supported in this browser. Please type your report.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Image upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImages((prev) => [
            ...prev,
            { file, preview: reader.result as string }
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Location selector pin helper
  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setAddress(addr);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setAddress("Locating...");
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
              headers: { "User-Agent": "AirSightAI-App" }
            });
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                setAddress(data.display_name.split(",").slice(0, 3).join(","));
              }
            }
          } catch {
            setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        },
        () => {
          alert("Unable to fetch location. Please pick a location manually on the map.");
        }
      );
    }
  };

  // Chat Assistant query handler
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatMessage("");
    setChatHistory((prev) => [...prev, { role: "user", parts: userMsg }]);
    setChatLoading(true);

    try {
      const response = await aiService.getChatbotResponse(userMsg, chatHistory);
      setChatHistory((prev) => [...prev, { role: "model", parts: response }]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        { role: "model", parts: "I apologize, I am experiencing server difficulties right now." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Form submission handler: calls Gemini analysis pipeline
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !latitude || !longitude) {
      alert("Please fill out title and pick location on the map.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(["Establishing Secure Uplink...", "Connecting to Gemini AI Engine..."]);

    let imageBase64 = "";
    let mimeType = "image/jpeg";
    if (selectedImages.length > 0) {
      imageBase64 = selectedImages[0].preview.split(",")[1];
      const match = selectedImages[0].preview.match(/data:(.*?);base64/);
      if (match) mimeType = match[1];
    }

    // Pipeline animations
    setTimeout(() => {
      setAnalysisProgress((prev) => [...prev, "Running Fake Image & Spam Filter Checks..."]);
    }, 1000);

    setTimeout(() => {
      setAnalysisProgress((prev) => [...prev, "Extracting Pollution Density Metrics..."]);
    }, 2000);

    setTimeout(() => {
      setAnalysisProgress((prev) => [...prev, "Calculating Smart Priority Matrix..."]);
    }, 3200);

    try {
      // Run AI Vision
      const aiResult = await aiService.analyzeImage(imageBase64, mimeType, description);
      setAiReportResult(aiResult);
      setAnalysisProgress((prev) => [...prev, "Verification Complete. Structuring report..."]);

      setTimeout(async () => {
        // Save report to db
        await db.createReport({
          citizen_id: userId,
          title: title,
          description: description || `AI Scan: ${aiResult.type}. Cause: ${aiResult.possibleCause}`,
          pollution_type: aiResult.type || pollutionType,
          severity: aiResult.severity,
          priority_score: aiResult.priorityScore,
          status: "Submitted",
          latitude: latitude,
          longitude: longitude,
          address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          image_url: selectedImages[0]?.preview || "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600",
        });

        // Trigger confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Reset Form
        setTitle("");
        setDescription("");
        setSelectedImages([]);
        setLatitude(null);
        setLongitude(null);
        setAddress("");
        setIsAnalyzing(false);
        setAiReportResult(null);
        setAnalysisProgress([]);

        // Reload db lists
        loadDatabaseData();
      }, 1500);

    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
      alert("AI pipeline encountered an error. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-cyan-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] rounded-full bg-emerald-900/10 blur-[100px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-[1050] bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center">
            <Brain className="w-5.5 h-5.5 text-slate-950" />
          </div>
          <div>
            <span className="font-outfit text-lg font-bold tracking-tight">AirSight</span>
            <span className="text-cyan-400 font-black"> AI</span>
          </div>
        </div>

        {/* User stats + tools */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Elena: {userProfile?.points || 0} Points</span>
          </div>

          {/* Notifications Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-cyan-400 border border-slate-950 rounded-full animate-ping" />
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-80 bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl z-[1060] text-xs"
                >
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-2.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-cyan-400" /> Notifications
                    </span>
                    <button
                      onClick={async () => {
                        await db.markAllNotificationsAsRead(userId);
                        loadDatabaseData();
                      }}
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-slate-500 text-center py-4">No new notifications.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-xl border ${
                            notif.read ? "bg-slate-950/20 border-white/5" : "bg-slate-950/60 border-cyan-500/10"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="font-bold text-slate-200">{notif.title}</span>
                            <span className="text-[9px] text-slate-500">{formatTimeAgo(notif.created_at)}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: NAVIGATION TAB & INPUT MODULE */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Quick tab navigator */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900/60 border border-white/5 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab("report")}
              className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === "report" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              <Upload className="w-4 h-4" /> New Report
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === "history" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" /> My Submissions ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === "leaderboard" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4" /> Leaderboard
            </button>
          </div>

          {/* TAB 1: NEW REPORT UPLOADER FORM */}
          {activeTab === "report" && (
            <GlassCard className="p-6 border-white/5" glowColor="cyan" hoverGlow={true}>
              <form onSubmit={handleSubmitReport} className="space-y-6">
                
                {/* Visual File Drag and Drop */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Upload Incident Media (Photos)
                  </label>
                  <div className="border border-dashed border-white/10 hover:border-cyan-500/40 rounded-2xl p-6 bg-slate-950/40 text-center relative transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-slate-900 border border-white/10 rounded-xl group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-xs text-slate-300 font-bold">Drag files here or click to browse</span>
                      <span className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP (Max 5MB)</span>
                    </div>
                  </div>

                  {/* Multi-image thumbnail previews */}
                  {selectedImages.length > 0 && (
                    <div className="flex gap-3 flex-wrap mt-3">
                      {selectedImages.map((img, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 shadow">
                          <img src={img.preview} alt="upload preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 p-1 rounded-full text-white shadow"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Voice Complaint Recorder */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Voice Dictation (AI-Parsed)
                  </label>
                  <div className="flex gap-4 items-center bg-slate-950/60 border border-white/5 p-4 rounded-2xl">
                    <button
                      type="button"
                      onClick={handleVoiceRecord}
                      className={`p-3.5 rounded-xl border flex items-center justify-center transition-all ${
                        isRecording
                          ? "bg-red-500/20 border-red-500/40 text-red-500 animate-pulse"
                          : "bg-slate-900 border-white/10 text-cyan-400 hover:bg-slate-800"
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    <div className="flex-1 text-xs">
                      {isRecording ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-red-400">Capturing Speech...</span>
                          <span className="text-[10px] text-slate-400">Speak clearly. Say type and location details.</span>
                        </div>
                      ) : (
                        <p className="text-slate-400">
                          {voiceTranscript || "Press mic button to record description verbally (Google Speech AI)."}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Text Title and Descriptions */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Complaint Headline</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Chemical plume leaking from pipe"
                      className="w-full bg-slate-950/60 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Detailed Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detail smells, impacts, size, or duration..."
                      className="w-full bg-slate-950/60 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-cyan-500/40 transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Coordinates & Location selectors */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Report Location</label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 hover:underline"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Use Current GPS
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 border border-white/5 px-4 py-3 rounded-xl text-xs">
                      <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Latitude</span>
                      <span className="font-mono text-slate-300 font-bold">
                        {latitude ? latitude.toFixed(6) : "Not selected"}
                      </span>
                    </div>
                    <div className="bg-slate-950/40 border border-white/5 px-4 py-3 rounded-xl text-xs">
                      <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Longitude</span>
                      <span className="font-mono text-slate-300 font-bold">
                        {longitude ? longitude.toFixed(6) : "Not selected"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-white/5 px-4 py-3 rounded-xl text-xs">
                    <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Extracted Address</span>
                    <span className="text-slate-300 font-medium">
                      {address || "Click on the right map grid to place a location marker pin"}
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <Sparkles className="w-4.5 h-4.5 text-slate-950" />
                  Initiate Gemini AI Analysis Pipeline
                </button>
              </form>
            </GlassCard>
          )}

          {/* TAB 2: CITIZEN HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {reports.length === 0 ? (
                <GlassCard className="p-8 border-white/5 text-center">
                  <p className="text-slate-400 text-sm mb-2">You haven't filed any reports yet.</p>
                  <button onClick={() => setActiveTab("report")} className="text-cyan-400 text-xs font-bold hover:underline">
                    File your first report now
                  </button>
                </GlassCard>
              ) : (
                reports.map((rep) => (
                  <GlassCard
                    key={rep.id}
                    className="p-5 border-white/5 flex flex-col md:flex-row gap-5"
                    glowColor={
                      rep.severity === "Critical" ? "rose" :
                      rep.severity === "High" ? "amber" :
                      rep.severity === "Medium" ? "blue" : "emerald"
                    }
                    hoverGlow={true}
                  >
                    {rep.image_url && (
                      <div className="w-full md:w-36 h-28 rounded-xl overflow-hidden border border-white/5 shrink-0">
                        <img src={rep.image_url} alt={rep.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-outfit font-bold text-base text-white">{rep.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                              rep.status === "Resolved"
                                ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                                : rep.status === "Assigned"
                                ? "bg-blue-500/20 border border-blue-500/30 text-blue-400"
                                : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-400"
                            }`}
                          >
                            {rep.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{rep.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-3 text-[10px] text-slate-500 font-semibold">
                        <span>Type: {rep.pollution_type}</span>
                        <span>Severity: <strong className="text-slate-300">{rep.severity}</strong></span>
                        <span>Priority Score: <strong className="text-cyan-400">{rep.priority_score}/100</strong></span>
                        <span>Reported: {formatTimeAgo(rep.created_at)}</span>
                      </div>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          )}

          {/* TAB 3: LEADERBOARD & BADGES */}
          {activeTab === "leaderboard" && (
            <GlassCard className="p-6 border-white/5" hoverGlow={true} glowColor="amber">
              <div className="text-center mb-6">
                <h3 className="font-outfit font-bold text-lg text-white">Community Cleanliness Leaderboard</h3>
                <p className="text-xs text-slate-400">Earn points by reporting verifiable pollution hazards and getting them resolved.</p>
              </div>

              {/* Leaderboard table */}
              <div className="space-y-3">
                {leaderboard.map((user, i) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border ${
                      user.id === userId
                        ? "bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                        : "bg-slate-950/40 border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        i === 0 ? "bg-yellow-400 text-slate-950" : i === 1 ? "bg-slate-300 text-slate-950" : "text-slate-400"
                      }`}>
                        #{i + 1}
                      </div>
                      <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                      <div>
                        <span className="font-semibold text-xs text-white block">{user.full_name}</span>
                        <div className="flex gap-1 mt-0.5">
                          {user.badges.slice(0, 2).map((b, idx) => (
                            <span key={idx} className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[8px] font-bold">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-outfit font-extrabold text-sm text-cyan-400 block">{user.points} XP</span>
                      <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Level {Math.floor(user.points / 200) + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </section>

        {/* RIGHT COLUMN: MAP PREVIEW & CHATBOT & SYSTEM STATS */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Map Viewer height wrapper */}
          <div className="h-[280px]">
            <InteractiveMap
              mode={activeTab === "report" ? "picker" : "viewer"}
              reports={reports}
              selectedLocation={latitude && longitude ? [latitude, longitude] : undefined}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          {/* Gamification mini view */}
          <GlassCard className="p-5 border-white/5" glowColor="emerald" hoverGlow={true}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Eco Badge Progress</span>
                <span className="text-sm font-bold text-white block">Level {Math.floor((userProfile?.points || 0) / 200) + 1} Citizen</span>
              </div>
              <div className="h-10 w-10 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 mt-4 overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full"
                style={{ width: `${((userProfile?.points || 0) % 200) / 2}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mt-2">
              <span>{(userProfile?.points || 0) % 200} / 200 XP</span>
              <span>Next badge: Hotspot Specialist</span>
            </div>
          </GlassCard>

          {/* Persistent AI Chatbot Widget */}
          <GlassCard className="p-5 border-white/5 flex flex-col gap-4 flex-1" glowColor="cyan">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-white">Gemini Environmental Guard</h4>
                <p className="text-[9px] text-slate-500">Ask about AQI, hazardous waste rules, or health guidelines</p>
              </div>
            </div>

            {/* Chat Messages scroll area */}
            <div className="flex-1 max-h-[220px] overflow-y-auto space-y-3 pr-2 text-xs">
              {chatHistory.length === 0 ? (
                <p className="text-slate-500 text-center py-6 leading-relaxed">
                  "Hello, I am the Gemini Assistant. You can ask me how to dispose of chemicals, check regional AQI reports, or understand air safety thresholds."
                </p>
              ) : (
                chatHistory.map((ch, idx) => (
                  <div key={idx} className={`flex ${ch.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                        ch.role === "user"
                          ? "bg-cyan-500 text-slate-950 rounded-br-none font-semibold"
                          : "bg-slate-950 border border-white/5 text-slate-300 rounded-bl-none"
                      }`}
                    >
                      {ch.parts}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-white/5 p-3 rounded-2xl rounded-bl-none text-slate-500 flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border border-slate-500 border-t-transparent rounded-full animate-spin" />
                    Gemini thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Input message form */}
            <form onSubmit={handleSendChatMessage} className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask environmental query..."
                className="flex-1 bg-slate-950/60 border border-white/5 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/40"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </GlassCard>
        </section>
      </main>

      {/* PIPELINE PROGRESS ANALYSIS MODAL OVERLAY */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center z-[2000] p-6"
          >
            <div className="max-w-md w-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/25 animate-bounce">
                <Brain className="w-9 h-9 text-slate-950" />
              </div>
              <h3 className="font-outfit font-extrabold text-lg text-white mb-2">Analyzing Pollution Incident</h3>
              <p className="text-xs text-slate-400 mb-8 max-w-sm mx-auto">
                Uploading report packet. Gemini 2.5 Flash is inspecting photos for duplicates, verifying safety metrics, and structuring database nodes.
              </p>

              <GlassCard className="p-5 border-white/5 bg-slate-900/40 text-left max-h-48 overflow-y-auto mb-6 scroll-smooth" hoverGlow={false}>
                <div className="space-y-2.5 text-xs font-mono">
                  {analysisProgress.map((prog, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                      <span className="text-slate-300">{prog}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full animate-[scroll_2s_linear_infinite]" style={{ width: "100%" }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
