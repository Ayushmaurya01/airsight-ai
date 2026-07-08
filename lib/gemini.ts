// Gemini API Integration Service

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";

export const isGeminiConfigured = !!GEMINI_API_KEY;

// Types
export interface AIImageAnalysis {
  type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  confidence: number;
  possibleCause: string;
  healthImpact: string;
  priorityScore: number;
  recommendation: string;
}

export interface AIVoiceAnalysis {
  location: string;
  pollution_type: string;
  summary: string;
  priority: "Low" | "Medium" | "High" | "Critical";
}

export interface AIPrediction {
  trend_24h: string;
  trend_3d: string;
  weather_impact: string;
  explanation: string;
}

export interface AIRecommendations {
  clean_suggestions: string[];
  estimated_workers: number;
  estimated_time: string;
  budget_estimate: number;
  emergency_level: string;
}

// Utility to fetch from Gemini REST API
async function callGemini(prompt: string, systemInstruction?: string, imageBase64?: string, imageMimeType?: string): Promise<string> {
  if (!isGeminiConfigured) {
    throw new Error("Gemini API key is not configured.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const contents: any[] = [];
  const parts: any[] = [{ text: prompt }];

  if (imageBase64 && imageMimeType) {
    parts.unshift({
      inlineData: {
        mimeType: imageMimeType,
        data: imageBase64,
      }
    });
  }

  contents.push({ parts });

  const body: any = {
    contents,
    generationConfig: {
      responseMimeType: "application/json",
    }
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API call failed: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("Empty response from Gemini API.");
  }

  return textResponse;
}

// AI SERVICE METHODS
export const aiService = {
  // 1. Analyze Pollution Image
  async analyzeImage(imageBase64: string, mimeType: string, descriptionHint?: string): Promise<AIImageAnalysis> {
    if (!isGeminiConfigured) {
      // Fallback Mock analysis
      await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate latency
      
      const hint = (descriptionHint || "").toLowerCase();
      let type = "General Solid Waste";
      let severity: AIImageAnalysis["severity"] = "Medium";
      let priorityScore = 45;
      let possibleCause = "Littering and lack of municipal disposal bins.";
      let healthImpact = "Minor respiratory irritation, physical safety risk.";
      let recommendation = "Schedule routine cleanup crew and install waste bins.";

      if (hint.includes("smoke") || hint.includes("fire") || hint.includes("burn")) {
        type = "Tire / Garbage Fire";
        severity = "Critical";
        priorityScore = 95;
        possibleCause = "Illegal garbage incineration releasing toxic dioxins.";
        healthImpact = "Hazardous. High PM2.5 levels, risk of acute asthma attacks and toxic inhalation.";
        recommendation = "Deploy emergency containment crew and notify public health agencies.";
      } else if (hint.includes("chemical") || hint.includes("water") || hint.includes("river") || hint.includes("drain") || hint.includes("leak")) {
        type = "Industrial Chemical Runoff";
        severity = "High";
        priorityScore = 85;
        possibleCause = "Improper chemical disposal or pipeline leakage from factory.";
        healthImpact = "Toxic. Heavy metal bioaccumulation and local water supply contamination.";
        recommendation = "Deploy hazardous containment booms and inspect nearby industrial drainage valves.";
      } else if (hint.includes("computer") || hint.includes("electronic") || hint.includes("battery")) {
        type = "Toxic E-Waste Dumping";
        severity = "High";
        priorityScore = 80;
        possibleCause = "Commercial electronics recycler bypassing legal sorting protocols.";
        healthImpact = "Biohazard. Lead and cadmium leaching into ground water.";
        recommendation = "Deploy specialized electronics collection team.";
      }

      return {
        type,
        severity,
        confidence: Math.floor(88 + Math.random() * 11),
        possibleCause,
        healthImpact,
        priorityScore,
        recommendation
      };
    }

    const systemInstruction = `You are a Senior Environmental AI Analyst for AirSight AI. Analyze the image of pollution and output a JSON object matching this schema:
    {
      "type": "Name of pollution type",
      "severity": "Low" | "Medium" | "High" | "Critical",
      "confidence": 0-100 (percentage),
      "possibleCause": "Brief analysis of what caused this",
      "healthImpact": "Details on public health implications",
      "priorityScore": 0-100 (urgency rating),
      "recommendation": "Next action item for municipal crew"
    }`;

    const prompt = `Analyze this pollution photo. Citizen description/hint: "${descriptionHint || 'None provided'}". Identify the pollution type, estimate severity, and provide recommended actions. Return JSON only.`;

    try {
      const responseText = await callGemini(prompt, systemInstruction, imageBase64, mimeType);
      return JSON.parse(responseText.trim()) as AIImageAnalysis;
    } catch (error) {
      console.error("Gemini Image Analysis failed, falling back to mock:", error);
      return this.analyzeImage("", "", descriptionHint); // Recursive call without API key will trigger mock fallback
    }
  },

  // 2. Transcribe & Analyze Voice Complaints
  async analyzeVoiceText(voiceText: string): Promise<AIVoiceAnalysis> {
    if (!isGeminiConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const txt = voiceText.toLowerCase();
      let location = "Unknown/General";
      let pollution_type = "Unspecified Pollution";
      let priority: AIVoiceAnalysis["priority"] = "Medium";
      let summary = voiceText;

      // Simple keyword matching for the mock
      if (txt.includes("hospital") || txt.includes("school") || txt.includes("kid")) {
        priority = "Critical";
      } else if (txt.includes("smoke") || txt.includes("fire")) {
        priority = "High";
      }

      if (txt.includes("near")) {
        const parts = voiceText.split(/near/i);
        if (parts.length > 1) location = parts[1].trim();
      } else if (txt.includes("at")) {
        const parts = voiceText.split(/at/i);
        if (parts.length > 1) location = parts[1].trim();
      }

      if (txt.includes("smoke")) {
        pollution_type = "Air Pollution / Smoke";
      } else if (txt.includes("sewage") || txt.includes("water")) {
        pollution_type = "Water Pollution";
      } else if (txt.includes("trash") || txt.includes("garbage")) {
        pollution_type = "Solid Waste";
      }

      return {
        location,
        pollution_type,
        summary,
        priority
      };
    }

    const systemInstruction = `Extract critical report details from the voice transcript and format as JSON matching this schema:
    {
      "location": "Extracted location descriptor or address, default to 'Street Level'",
      "pollution_type": "Short categorization e.g. Air/Water/Toxic/Trash",
      "summary": "Short 1-sentence recap of the complaint",
      "priority": "Low" | "Medium" | "High" | "Critical"
    }`;

    const prompt = `Transcribed voice complaint: "${voiceText}". Parse details. Return JSON.`;

    try {
      const responseText = await callGemini(prompt, systemInstruction);
      return JSON.parse(responseText.trim()) as AIVoiceAnalysis;
    } catch (e) {
      console.error("Gemini Voice analysis failed, falling back to mock:", e);
      return this.analyzeVoiceText(voiceText);
    }
  },

  // 3. Predictions for Municipal Command
  async getPredictions(reportType: string, severity: string, weatherText: string): Promise<AIPrediction> {
    if (!isGeminiConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        trend_24h: severity === "Critical" ? "Escalating rapidly due to wind speed dispersal." : "Stable. Dispersion holds at nominal levels.",
        trend_3d: severity === "Critical" || severity === "High" ? "Critical levels predicted if source discharge is not sealed." : "Gradual natural decay expected as winds clear the area.",
        weather_impact: `Wind from North shifts pollutants towards residential areas. High humidity is trapping particulates lower to ground.`,
        explanation: "Based on historical regional reports, solid waste burns have a high index of toxicity that lingers for up to 3 days in humid, low-wind conditions."
      };
    }

    const systemInstruction = `You are a Predictive Environmental AI. Based on report type, severity, and current weather, project the spread and impact. Return JSON matching:
    {
      "trend_24h": "Short forecast for the next 24 hours",
      "trend_3d": "Short forecast for the next 3 days",
      "weather_impact": "Description of how current weather alters the impact",
      "explanation": "Scientific explanation of predicted spread"
    }`;

    const prompt = `Report type: ${reportType}, Severity: ${severity}, Current Weather: ${weatherText}. Run predictive model. Return JSON.`;

    try {
      const responseText = await callGemini(prompt, systemInstruction);
      return JSON.parse(responseText.trim()) as AIPrediction;
    } catch (e) {
      console.error("Gemini Predictions failed, falling back to mock:", e);
      return this.getPredictions(reportType, severity, weatherText);
    }
  },

  // 4. Cleanup Recommendations
  async getRecommendations(reportType: string, severity: string): Promise<AIRecommendations> {
    if (!isGeminiConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      let clean_suggestions = ["Deploy basic cleanup crew.", "Sort waste into organic and recyclable.", "Place warnings around area."];
      let estimated_workers = 3;
      let estimated_time = "4 hours";
      let budget_estimate = 350;
      let emergency_level = "Medium";

      if (severity === "Critical") {
        clean_suggestions = ["Evacuate downwind areas.", "Deploy absorbent hazardous chemical booms.", "Alert municipal toxic control squad."];
        estimated_workers = 8;
        estimated_time = "12 hours";
        budget_estimate = 4500;
        emergency_level = "Critical";
      } else if (severity === "High") {
        clean_suggestions = ["Deploy heavy machinery for debris removal.", "Notify county fire unit for standby.", "Block local traffic access."];
        estimated_workers = 5;
        estimated_time = "8 hours";
        budget_estimate = 1200;
        emergency_level = "High";
      }

      return {
        clean_suggestions,
        estimated_workers,
        estimated_time,
        budget_estimate,
        emergency_level
      };
    }

    const systemInstruction = `You are a Civic Action Recommendation AI. Suggest resource allocation, budgets, and worker quantities for resolving environmental hazards. Return JSON matching:
    {
      "clean_suggestions": ["Action item 1", "Action item 2", "Action item 3"],
      "estimated_workers": Number (total headcount needed),
      "estimated_time": "Time estimate (e.g. 5 hours)",
      "budget_estimate": Number (in USD cost estimate),
      "emergency_level": "Low" | "Medium" | "High" | "Critical"
    }`;

    const prompt = `Report type: ${reportType}, Severity: ${severity}. Estimate requirements. Return JSON.`;

    try {
      const responseText = await callGemini(prompt, systemInstruction);
      return JSON.parse(responseText.trim()) as AIRecommendations;
    } catch (e) {
      console.error("Gemini Recommendations failed, falling back to mock:", e);
      return this.getRecommendations(reportType, severity);
    }
  },

  // 5. AI Chatbot queries
  async getChatbotResponse(message: string, history: { role: "user" | "model"; parts: string }[]): Promise<string> {
    if (!isGeminiConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const msg = message.toLowerCase();
      
      if (msg.includes("aqi") || msg.includes("air quality")) {
        return "The local **Air Quality Index (AQI)** for San Francisco is currently **54 (Moderate)**. The primary pollutant is PM2.5. We recommend sensitive individuals (with asthma or heart disease) limit prolonged outdoor exertion.";
      }
      if (msg.includes("recycle") || msg.includes("dispose")) {
        return "To recycle electronics (E-waste) in San Francisco, you can take them to the Recology Transfer Station at 501 Tunnel Ave or drop them off at designated Best Buy or Staples locations. Never put batteries or monitors in standard trash bins, as they are biohazards!";
      }
      if (msg.includes("health") || msg.includes("smoke")) {
        return "Inhalation of smoke from garbage fires exposes you to carbon monoxide, particulate matter (PM2.5), and volatile organic compounds (VOCs). If you smell smoke nearby, keep your windows closed, run your indoor air purifier, and seek medical attention if you experience wheezing or chest tightness.";
      }
      if (msg.includes("hotspot") || msg.includes("most polluted")) {
        return "Based on citizen reports on the AirSight AI dashboard, our top pollution hotspots this week are the **Mission Creek canal** (chemical discharge) and **SoMa district** (air quality issues related to construction dust and garbage burning).";
      }

      return "Hello! I am your AirSight Environmental Assistant. You can ask me about: \n- Current AQI and Health Warnings\n- Local Pollution Hotspots\n- Recycling & E-Waste guidelines\n- How to file an emergency municipal complaint";
    }

    const systemInstruction = "You are the AirSight AI Assistant. You help citizens and administrators with questions about environmental health, local pollution reports, AQI, recycling rules, and civic actions. Keep answers helpful, readable, and in markdown. You have access to local reports context indicating some issues with chemical leaks at Mission Creek and tire burning in SoMa.";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const formattedContents = [
      ...history.map(h => ({
        role: h.role,
        parts: [{ text: h.parts }]
      })),
      {
        role: "user",
        parts: [{ text: message }]
      }
    ];

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: formattedContents,
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I am unable to generate a response at this time.";
    } catch (e) {
      console.error("Gemini Chat failed, falling back to mock:", e);
      return this.getChatbotResponse(message, []);
    }
  }
};
