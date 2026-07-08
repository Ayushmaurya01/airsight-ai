import { createClient } from "@supabase/supabase-js";

// Check environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// TYPES
export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: "citizen" | "admin";
  points: number;
  badges: string[];
  created_at: string;
}

export interface Report {
  id: string;
  citizen_id: string;
  citizen_name?: string;
  title: string;
  description: string;
  pollution_type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  priority_score: number;
  status: "Submitted" | "Under Review" | "Verified" | "Assigned" | "Resolved";
  latitude: number;
  longitude: number;
  address: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  report_id: string;
  trend_24h: string;
  trend_3d: string;
  weather_impact: string;
  clean_suggestions: string[];
  estimated_workers: number;
  estimated_time: string;
  budget_estimate: number;
  emergency_level: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "submitted" | "under_review" | "verified" | "assigned" | "resolved" | "critical_alert" | "hotspot_warning";
  read: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  report_id: string;
  author_name: string;
  avatar_url: string;
  content: string;
  created_at: string;
}

// MOCK DATA SEED
const SEED_PROFILES: Profile[] = [
  {
    id: "user-1",
    full_name: "Elena Rostova",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    role: "citizen",
    points: 850,
    badges: ["Green Guardian", "First Responder", "Hotspot Hunter"],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user-2",
    full_name: "Marcus Chen",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    role: "citizen",
    points: 420,
    badges: ["Eco Activist", "Detail Oriented"],
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "user-admin",
    full_name: "Chief Inspector Sarah Jenkins",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    role: "admin",
    points: 0,
    badges: ["Civic Master"],
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const SEED_REPORTS: Report[] = [
  {
    id: "rep-1",
    citizen_id: "user-1",
    citizen_name: "Elena Rostova",
    title: "Illegal E-Waste Dump",
    description: "Dozens of discarded computer monitors, lithium batteries, and server racks dumped behind the municipal community center. Fumes are noticeable, and rain could leach heavy metals into the soil.",
    pollution_type: "E-Waste / Toxic",
    severity: "High",
    priority_score: 85,
    status: "Assigned",
    latitude: 37.7512,
    longitude: -122.4124,
    address: "2450 Harrison St, San Francisco, CA 94110",
    image_url: "https://images.unsplash.com/photo-1604186838327-0cf0449439c3?w=600",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rep-2",
    citizen_id: "user-2",
    citizen_name: "Marcus Chen",
    title: "Chemical Discharge in Creek",
    description: "Milky, toxic chemical runoff flowing directly from an unmarked industrial pipe into the Mission Creek canal. Strong acidic smell, dead fish spotted along the bank.",
    pollution_type: "Industrial Chemical runoff",
    severity: "Critical",
    priority_score: 96,
    status: "Verified",
    latitude: 37.7706,
    longitude: -122.3995,
    address: "Channel St & 4th St, San Francisco, CA 94158",
    image_url: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600",
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rep-3",
    citizen_id: "user-1",
    citizen_name: "Elena Rostova",
    title: "Tire Pile Burning",
    description: "Massive pile of vehicle tires set ablaze at an abandoned lot. Thick, black carbon soot billowing directly towards the adjacent community hospital and elementary school.",
    pollution_type: "Air Pollution (Soot/Toxic Gas)",
    severity: "Critical",
    priority_score: 98,
    status: "Under Review",
    latitude: 37.7885,
    longitude: -122.4074,
    address: "5th St & Folsom St, San Francisco, CA 94103",
    image_url: "https://images.unsplash.com/photo-1599740831146-8141f713a503?w=600",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: "rep-4",
    citizen_id: "user-2",
    citizen_name: "Marcus Chen",
    title: "Plastic Waste Choking Storm Drain",
    description: "Hundreds of plastic bottles, single-use bags, and styrofoam boxes clogging the stormwater outlet. Heavy rain is expected tomorrow, which will wash all of this into the bay.",
    pollution_type: "Plastic / Solid Waste",
    severity: "Medium",
    priority_score: 55,
    status: "Submitted",
    latitude: 37.7645,
    longitude: -122.4194,
    address: "16th St & Valencia St, San Francisco, CA 94103",
    image_url: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rep-5",
    citizen_id: "user-1",
    citizen_name: "Elena Rostova",
    title: "Sewage Line Overflow",
    description: "Raw sewage bubbling up from a damaged manhole cover. Flowing down the street with a severe health hazard risk. Neighbors are reporting headaches.",
    pollution_type: "Water / Bio-hazard",
    severity: "Critical",
    priority_score: 92,
    status: "Resolved",
    latitude: 37.8037,
    longitude: -122.4368,
    address: "3200 Fillmore St, San Francisco, CA 94123",
    image_url: "https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=600",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "rep-6",
    citizen_id: "user-2",
    citizen_name: "Marcus Chen",
    title: "Construction Dust Plume",
    description: "Excavation site running without water sprays. Strong winds are blowing massive clouds of fine silica dust over the adjacent apartment buildings, causing breathing difficulties for seniors.",
    pollution_type: "Particulate Matter (PM10)",
    severity: "Medium",
    priority_score: 64,
    status: "Resolved",
    latitude: 37.7628,
    longitude: -122.4348,
    address: "400 Castro St, San Francisco, CA 94114",
    image_url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const SEED_PREDICTIONS: Record<string, Prediction> = {
  "rep-1": {
    id: "pred-1",
    report_id: "rep-1",
    trend_24h: "Stable. Chemical runoff risk low unless rainfall occurs.",
    trend_3d: "Deteriorating. Toxic leaching is highly likely due to 80% forecast rain on Friday.",
    weather_impact: "Wind NW 12mph, Humidity 75%, Rain expected in 48h.",
    clean_suggestions: [
      "Use hazardous material sorting bins.",
      "Requires battery isolation protocols.",
      "Wear puncture-resistant gloves and protective suits."
    ],
    estimated_workers: 4,
    estimated_time: "5 hours",
    budget_estimate: 850,
    emergency_level: "High",
    created_at: new Date().toISOString()
  },
  "rep-2": {
    id: "pred-2",
    report_id: "rep-2",
    trend_24h: "Deteriorating quickly. Contaminants are flowing at 2.4 liters/min downstream.",
    trend_3d: "Severe. Will reach SF Bay delta ecosystem within 36 hours if not blocked.",
    weather_impact: "High tide at 6 PM will push chemicals back up the canal, spreading toxic area.",
    clean_suggestions: [
      "Deploy absorbent chemical booms immediately.",
      "Use vacuum truck to extract pooling liquid.",
      "Trace pipe back to source facility and shut valve."
    ],
    estimated_workers: 8,
    estimated_time: "12 hours",
    budget_estimate: 4200,
    emergency_level: "Critical",
    created_at: new Date().toISOString()
  },
  "rep-3": {
    id: "pred-3",
    report_id: "rep-3",
    trend_24h: "Highly dangerous. Soot plume dispersing into dense residential blocks.",
    trend_3d: "Expected resolution within 12 hours once firefighters extinguish core fire.",
    weather_impact: "Wind blowing directly East towards City Hospital at 15mph.",
    clean_suggestions: [
      "Evacuate hospital eastern wing ventilation system intakes.",
      "Issue particulate matter (PM2.5) air alerts to schools.",
      "Deploy heavy foam suppressors."
    ],
    estimated_workers: 15,
    estimated_time: "8 hours",
    budget_estimate: 7800,
    emergency_level: "Critical",
    created_at: new Date().toISOString()
  },
  "rep-4": {
    id: "pred-4",
    report_id: "rep-4",
    trend_24h: "Stable. Clog is holding but backing up local drainage basin.",
    trend_3d: "Critical risk of local street flooding if storm hits before clearing.",
    weather_impact: "Rain forecast tomorrow morning. High drainage demand.",
    clean_suggestions: [
      "Deploy municipal suction truck.",
      "Install trash capture screens.",
      "Manual raking of gutter intakes."
    ],
    estimated_workers: 2,
    estimated_time: "2 hours",
    budget_estimate: 250,
    emergency_level: "Medium",
    created_at: new Date().toISOString()
  }
};

const SEED_COMMENTS: Record<string, Comment[]> = {
  "rep-1": [
    {
      id: "c-1",
      report_id: "rep-1",
      author_name: "Inspector Sarah Jenkins",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      content: "Team assigned. We are dispatching a recycling unit specializing in electronic waste. Scheduled for dispatch tomorrow morning.",
      created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
    }
  ],
  "rep-2": [
    {
      id: "c-2",
      report_id: "rep-2",
      author_name: "Inspector Sarah Jenkins",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      content: "Alerted water protection agency. Boom trucks are en route. Priority score calculated at 96/100 due to proximity to the bay.",
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    }
  ]
};

// STORAGE ACTIONS IN LOCALSTORAGE
const getStoredData = <T>(key: string, seed: T): T => {
  if (typeof window === "undefined") return seed;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return seed;
  }
};

const setStoredData = <T>(key: string, data: T): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// INITIALIZE MOCK DATA ENGINE
let mockProfiles = getStoredData("airsight_profiles", SEED_PROFILES);
let mockReports = getStoredData("airsight_reports", SEED_REPORTS);
let mockPredictions = getStoredData("airsight_predictions", SEED_PREDICTIONS);
let mockComments = getStoredData("airsight_comments", SEED_COMMENTS);
let mockNotifications = getStoredData("airsight_notifications", [
  {
    id: "notif-1",
    user_id: "user-1",
    title: "Report Verified by AI",
    message: "Your report of 'Illegal E-Waste Dump' has been verified. Priority Score: 85.",
    type: "verified",
    read: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "notif-2",
    user_id: "user-1",
    title: "Task Assigned",
    message: "Clean-up crew assigned to Harrison St dump site.",
    type: "assigned",
    read: false,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "notif-3",
    user_id: "user-admin",
    title: "Critical Pollution Alert",
    message: "New Critical Report: 'Tire Pile Burning' near 5th & Folsom. Priority: 98.",
    type: "critical_alert",
    read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
]);

// DB ADAPTER EXPORTS
export const db = {
  // Profiles
  async getProfiles(): Promise<Profile[]> {
    if (supabase) {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error && data) return data as Profile[];
    }
    return mockProfiles;
  },

  async getProfile(id: string): Promise<Profile | null> {
    if (supabase) {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (!error && data) return data as Profile;
    }
    return mockProfiles.find((p) => p.id === id) || null;
  },

  async updateProfilePoints(id: string, pointsToAdd: number, badgeAwarded?: string): Promise<Profile | null> {
    if (supabase) {
      const { data: profile } = await supabase.from("profiles").select("points, badges").eq("id", id).single();
      if (profile) {
        const newPoints = (profile.points || 0) + pointsToAdd;
        const newBadges = [...(profile.badges || [])];
        if (badgeAwarded && !newBadges.includes(badgeAwarded)) {
          newBadges.push(badgeAwarded);
        }
        const { data, error } = await supabase
          .from("profiles")
          .update({ points: newPoints, badges: newBadges })
          .eq("id", id)
          .select()
          .single();
        if (!error && data) return data as Profile;
      }
    }

    const pIndex = mockProfiles.findIndex((p) => p.id === id);
    if (pIndex !== -1) {
      mockProfiles[pIndex].points += pointsToAdd;
      if (badgeAwarded && !mockProfiles[pIndex].badges.includes(badgeAwarded)) {
        mockProfiles[pIndex].badges.push(badgeAwarded);
      }
      setStoredData("airsight_profiles", mockProfiles);
      return mockProfiles[pIndex];
    }
    return null;
  },

  // Reports
  async getReports(): Promise<Report[]> {
    if (supabase) {
      const { data, error } = await supabase.from("reports").select("*, profiles(full_name)").order("created_at", { ascending: false });
      if (!error && data) {
        return data.map((r: any) => ({
          ...r,
          citizen_name: r.profiles?.full_name || "Anonymous Citizen"
        })) as Report[];
      }
    }
    return [...mockReports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async createReport(report: Omit<Report, "id" | "created_at" | "updated_at">): Promise<Report> {
    const newReport: Report = {
      ...report,
      id: "rep-" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase.from("reports").insert([report]).select().single();
      if (!error && data) return data as Report;
    }

    mockReports.push(newReport);
    setStoredData("airsight_reports", mockReports);

    // Create a mock prediction & AI check for this report
    const mockPred: Prediction = {
      id: "pred-" + Math.random().toString(36).substr(2, 9),
      report_id: newReport.id,
      trend_24h: "Analyzing. Wind patterns suggest dispersion within local limits.",
      trend_3d: "Expected cleanup within 72h. Risk factors: moderate.",
      weather_impact: "Clear skies. Light wind.",
      clean_suggestions: [
        "Deploy basic containment equipment.",
        "Requires standard cleanup crew.",
        "Post notifications in local community forum."
      ],
      estimated_workers: 2,
      estimated_time: "4 hours",
      budget_estimate: 300,
      emergency_level: newReport.severity === "Critical" ? "Critical" : newReport.severity === "High" ? "High" : "Medium",
      created_at: new Date().toISOString(),
    };
    mockPredictions[newReport.id] = mockPred;
    setStoredData("airsight_predictions", mockPredictions);

    // Trigger notification
    this.addNotification({
      user_id: report.citizen_id,
      title: "Report Submitted",
      message: `Your report '${report.title}' has been submitted for AI analysis.`,
      type: "submitted",
    });

    // Award points
    this.updateProfilePoints(report.citizen_id, 50);

    return newReport;
  },

  async updateReportStatus(id: string, status: Report["status"]): Promise<Report | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from("reports")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) return data as Report;
    }

    const rIndex = mockReports.findIndex((r) => r.id === id);
    if (rIndex !== -1) {
      mockReports[rIndex].status = status;
      mockReports[rIndex].updated_at = new Date().toISOString();
      setStoredData("airsight_reports", mockReports);

      // Create notification
      const r = mockReports[rIndex];
      const typeMap: Record<string, Notification["type"]> = {
        "Under Review": "under_review",
        "Verified": "verified",
        "Assigned": "assigned",
        "Resolved": "resolved",
      };

      this.addNotification({
        user_id: r.citizen_id,
        title: `Report Status: ${status}`,
        message: `Your pollution report '${r.title}' is now ${status}.`,
        type: typeMap[status] || "verified",
      });

      if (status === "Resolved") {
        this.updateProfilePoints(r.citizen_id, 100, "Eco Hero");
      }

      return r;
    }
    return null;
  },

  // Predictions & Recommendations
  async getPredictionsForReport(reportId: string): Promise<Prediction | null> {
    if (supabase) {
      const { data, error } = await supabase.from("predictions").select("*").eq("report_id", reportId).single();
      if (!error && data) return data as Prediction;
    }
    return mockPredictions[reportId] || {
      id: "pred-default",
      report_id: reportId,
      trend_24h: "Minimal impact expected.",
      trend_3d: "Dissipating completely.",
      weather_impact: "Calm conditions.",
      clean_suggestions: ["No active cleanup required."],
      estimated_workers: 0,
      estimated_time: "N/A",
      budget_estimate: 0,
      emergency_level: "Low",
      created_at: new Date().toISOString()
    };
  },

  async addPrediction(pred: Omit<Prediction, "id" | "created_at">): Promise<Prediction> {
    const newPred = {
      ...pred,
      id: "pred-" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString()
    };
    if (supabase) {
      const { data, error } = await supabase.from("predictions").insert([pred]).select().single();
      if (!error && data) return data as Prediction;
    }
    mockPredictions[pred.report_id] = newPred;
    setStoredData("airsight_predictions", mockPredictions);
    return newPred;
  },

  // Comments
  async getComments(reportId: string): Promise<Comment[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("comments")
        .select("*, profiles(full_name, avatar_url)")
        .eq("report_id", reportId)
        .order("created_at", { ascending: true });
      if (!error && data) {
        return data.map((c: any) => ({
          id: c.id,
          report_id: c.report_id,
          author_name: c.profiles?.full_name || "Anonymous",
          avatar_url: c.profiles?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
          content: c.content,
          created_at: c.created_at
        }));
      }
    }
    return mockComments[reportId] || [];
  },

  async addComment(comment: { report_id: string; author_id: string; content: string }): Promise<Comment> {
    const user = mockProfiles.find((p) => p.id === comment.author_id) || mockProfiles[2];
    const newComment: Comment = {
      id: "c-" + Math.random().toString(36).substr(2, 9),
      report_id: comment.report_id,
      author_name: user.full_name,
      avatar_url: user.avatar_url,
      content: comment.content,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { data, error } = await supabase.from("comments").insert([comment]).select().single();
      if (!error && data) return newComment;
    }

    if (!mockComments[comment.report_id]) {
      mockComments[comment.report_id] = [];
    }
    mockComments[comment.report_id].push(newComment);
    setStoredData("airsight_comments", mockComments);

    return newComment;
  },

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) return data as Notification[];
    }
    return mockNotifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async addNotification(n: Omit<Notification, "id" | "read" | "created_at">): Promise<Notification> {
    const newNotif: Notification = {
      ...n,
      id: "notif-" + Math.random().toString(36).substr(2, 9),
      read: false,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      await supabase.from("notifications").insert([n]);
    }

    mockNotifications.unshift(newNotif);
    setStoredData("airsight_notifications", mockNotifications);
    return newNotif;
  },

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    if (supabase) {
      await supabase.from("notifications").update({ read: true }).eq("user_id", userId);
    }
    mockNotifications = mockNotifications.map((n) =>
      n.user_id === userId ? { ...n, read: true } : n
    );
    setStoredData("airsight_notifications", mockNotifications);
  },

  // Stats Analytics
  async getStats() {
    const reports = await this.getReports();
    const total = reports.length;
    const resolved = reports.filter((r) => r.status === "Resolved").length;
    const pending = reports.filter((r) => r.status !== "Resolved").length;
    const critical = reports.filter((r) => r.severity === "Critical").length;
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const today = reports.filter((r) => new Date(r.created_at) >= todayStart).length;

    // Severity breakdown
    const severityBreakdown = {
      Low: reports.filter((r) => r.severity === "Low").length,
      Medium: reports.filter((r) => r.severity === "Medium").length,
      High: reports.filter((r) => r.severity === "High").length,
      Critical: reports.filter((r) => r.severity === "Critical").length,
    };

    // Monthly trends
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIndex = new Date().getMonth();
    const monthlyTrends = Array.from({ length: 6 }).map((_, i) => {
      const idx = (currentMonthIndex - 5 + i + 12) % 12;
      const m = months[idx];
      
      // Filter reports in that month (simulated)
      let count = 8 + Math.floor(Math.random() * 12);
      if (i === 5) count = total; // scale current month to total
      return { month: m, reports: count, resolved: Math.floor(count * 0.7) };
    });

    // Top areas
    const topAreas = [
      { name: "Mission District", reports: reports.filter((r) => r.address.includes("Harrison") || r.address.includes("Valencia") || r.address.includes("Castro")).length + 3 },
      { name: "SoMa", reports: reports.filter((r) => r.address.includes("5th St") || r.address.includes("Folsom")).length + 2 },
      { name: "Marina District", reports: reports.filter((r) => r.address.includes("Fillmore") || r.address.includes("Marina")).length + 1 },
      { name: "Downtown / Financial", reports: 2 }
    ].sort((a, b) => b.reports - a.reports);

    return {
      total,
      resolved,
      pending,
      critical,
      today,
      severityBreakdown,
      monthlyTrends,
      topAreas,
    };
  }
};
