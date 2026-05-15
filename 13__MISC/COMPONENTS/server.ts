import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";

const OPENROUTER_KEYS: Record<string, string> = {
  "perbrinell@gmail.com": "sk-or-v1-REDACTED_KEY_REPLACE_WITH_REAL_KEY7497bd72",
  "pellegrosso@gmail.com": "sk-or-v1-REDACTED_KEY_REPLACE_WITH_REAL_KEYc1a039e5",
  "leadagenticos@gmail.com": "sk-or-v1-REDACTED_KEY_REPLACE_WITH_REAL_KEY28c187dc",
  "hlivfachapman2000@gmail.com": "sk-or-v1-REDACTED_KEY_REPLACE_WITH_REAL_KEY17180602",
  "carl.august.lucien@gmail.com": "sk-or-v1-REDACTED_KEY_REPLACE_WITH_REAL_KEY90d9a0cd",
  "cymwave@gmail.com": "sk-or-v1-REDACTED_KEY_REPLACE_WITH_REAL_KEY8925ce0c"
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "SITK Kernel Online" });
  });

  // OpenRouter Router Interface
  app.get("/api/router/status", (req, res) => {
    const userEmail = req.query.email as string;
    const hasKey = !!OPENROUTER_KEYS[userEmail];
    res.json({
      active: hasKey,
      availableKeys: Object.keys(OPENROUTER_KEYS).length,
      currentIdentity: userEmail || "anonymous",
      isRouted: hasKey
    });
  });

  app.post("/api/router/completions", async (req, res) => {
    const { email, model, messages } = req.body;
    const apiKey = OPENROUTER_KEYS[email] || OPENROUTER_KEYS["pellegrosso@gmail.com"]; // Default fallback
    
    if (!apiKey) {
      return res.status(401).json({ error: "No API Key found for this identity" });
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://sitk.dev",
          "X-Title": "SITK Agentic Foundation",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model || "google/gemini-2.0-flash-exp:free",
          messages: messages
        })
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to reach OpenRouter" });
    }
  });

  // File Server Overview Mock
  app.get("/api/fs/stats", (req, res) => {
    res.json({
      totalFiles: 142,
      totalSize: "1.2GB",
      lastSync: new Date().toISOString(),
      activeStreams: 3
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
