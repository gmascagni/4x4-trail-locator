import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.use(express.json());

  // API Route: Get AI 4x4 Trail Insights
  app.post("/api/trail-insights", async (req, res) => {
    const { trailName, region } = req.body;
    if (!trailName) return res.status(400).json({ error: "Trail name is required" });

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Provide 4x4 off-roading, rock crawling, and Jeep trail details for "${trailName}" in "${region || 'nearby off-road area'}".
        Include:
        - difficultyScale (number 1 to 10)
        - badgeOfHonor (boolean, true if it's a Jeep Badge of Honor trail)
        - minClearance (string, e.g. "10.5 inches")
        - recommendedTireSize (number, e.g. 33, 35, 37)
        - proSummary (2-sentence pro off-roader take)
        - obstacleWarnings (array of strings, key technical obstacles)
        Format as JSON: { "difficultyScale": number, "badgeOfHonor": boolean, "minClearance": string, "recommendedTireSize": number, "proSummary": string, "obstacleWarnings": string[] }`,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const insights = JSON.parse(response.text || '{}');
      res.json(insights);
    } catch (error) {
      console.error("Gemini Error:", error);
      res.json({
        difficultyScale: 5,
        badgeOfHonor: false,
        minClearance: "10.0 inches",
        recommendedTireSize: 33,
        proSummary: "Rugged off-road trail with rocky ledges and loose climbs. Air down tires to 15 PSI.",
        obstacleWarnings: ["Use a spotter on off-camber obstacles", "Inspect water crossing depths before entering"]
      });
    }
  });

  // Weather Cache
  const weatherCache = new Map<string, { data: any; expiresAt: number }>();

  app.get("/api/weather", async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Missing coordinates" });
    
    const gridKey = `${Number(lat).toFixed(1)}_${Number(lng).toFixed(1)}`;
    const now = Date.now();
    const cached = weatherCache.get(gridKey);

    if (cached && cached.expiresAt > now) {
      return res.json(cached.data);
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day&past_days=2&daily=precipitation_sum,rain_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`Open-Meteo error: ${response.status}`);
      const data = await response.json();
      
      weatherCache.set(gridKey, {
        data,
        expiresAt: now + 15 * 60 * 1000
      });
      
      res.json(data);
    } catch (error) {
      const fallback = {
        latitude: Number(lat),
        longitude: Number(lng),
        current: {
          time: new Date().toISOString(),
          temperature_2m: 74.0,
          apparent_temperature: 73.0,
          relative_humidity_2m: 35,
          precipitation: 0.0,
          weather_code: 0,
          wind_speed_10m: 5.5,
          is_day: 1
        }
      };
      res.json(fallback);
    }
  });

  // API Config
  app.get("/api/config", (req, res) => {
    res.json({
      googleMapsApiKey: process.env.GOOGLE_MAPS_PLATFORM_KEY || '',
    });
  });

  // Directly serve root static assets and index.html
  app.use(express.static(process.cwd()));
  app.get("*", (req, res) => {
    res.sendFile(path.join(process.cwd(), "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TrailFinder 4x4 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
