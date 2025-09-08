// Set NODE_ENV to development if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

import express, { type Request, Response, NextFunction } from "express";
import { spawn } from "child_process";
import * as pathModule from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { registerLogisticsRoutes } from "./logistics-routes";
import { registerPacotesRoutes } from "./pacotes-routes";
import { registerSubscriptionRoutes } from "./subscription-routes";
import { registerVolumesRoutes } from "./volumes-routes";
import { registerOrdensCargaRoutes } from "./ordens-carga-routes";
import { registerRastreamentoRoutes } from "./rastreamento-routes";
import clienteTransportadorRoutes from "./clientes-transportador-routes";
import { registerFilaXRoutes } from "./fila-x-routes";
import usersRoutes from "./users-routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { storage } from "./storage";

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

const app = express();
// Aumentar limite de payload para suportar importação de múltiplas NFe com XML completo
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Domain configuration for custom domain
const allowedDomains = [
  'localhost',
  'crosswms.com.br',
  'www.crosswms.com.br',
  process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : null,
  process.env.REPLIT_DEV_DOMAIN ? `${process.env.REPLIT_DEV_DOMAIN}` : null
].filter(Boolean);

app.use((req, res, next) => {
  const host = req.get('host');
  const origin = req.get('origin');
  
  // CORS for custom domain
  if (origin && allowedDomains.some(domain => domain && origin.includes(domain))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  }
  
  // Cache control headers to prevent post-deploy version issues
  if (req.path.endsWith('.js') || req.path.endsWith('.css') || req.path.endsWith('.html')) {
    // For static assets with hash in filename, cache for 1 year
    if (req.path.includes('-') && /\.[a-f0-9]{8,}\.(js|css)$/.test(req.path)) {
      res.header('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      // For HTML and non-hashed assets, no cache
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.header('Pragma', 'no-cache');
      res.header('Expires', '0');
    }
  }
  
  // Domain handling - let Cloudflare handle redirects
  // Removed automatic redirect to prevent loop with Cloudflare
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  registerLogisticsRoutes(app);
  registerPacotesRoutes(app);
  registerSubscriptionRoutes(app);
  registerVolumesRoutes(app);
  registerOrdensCargaRoutes(app);
  registerRastreamentoRoutes(app);
  registerFilaXRoutes(app);
  app.use('/api/users', usersRoutes);
  app.use('/api', clienteTransportadorRoutes);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Always setup vite in development for now
  // Custom domain will work through Replit's deployment system
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 8080
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 8080;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();