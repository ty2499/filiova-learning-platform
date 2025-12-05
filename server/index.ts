import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { registerEmailRoutes } from "./emailRoutes";
import { setupWebSocket } from "./websocket";
import { setupVite, serveStatic, log } from "./vite";
import { locationDetectionMiddleware } from "./middleware/location";
import { emailService } from "./emailService";
import { r2RedirectMiddleware } from "./r2-redirect-middleware";
import { seedEmailTemplates } from "./seed-email-templates";
import { seedEmailSegments } from "./seed-email-segments";

// CRITICAL: Keep process alive - must be at top level, runs immediately
// This prevents Node.js from exiting even if async initialization fails
console.log('🔒 [KEEP-ALIVE] Process keep-alive initialized');
const keepAliveInterval = setInterval(() => {
  // This interval keeps the Node.js event loop active
}, 30000); // Every 30 seconds

// Prevent the keep-alive from being garbage collected
(globalThis as any).__keepAlive = keepAliveInterval;

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Handle warnings
process.on('warning', (warning) => {
  console.warn('Warning:', warning.message);
});

const app = express();

// Skip body parsing for logo upload routes (need raw body for signature verification)
app.use((req, res, next) => {
  if (req.url.includes('/api/admin/settings/logo') && req.method === 'POST') {
    console.log('🔥 Skipping body parsing for logo upload:', req.url);
    // Skip all body parsing for logo uploads
    return next();
  }
  // Apply normal body parsing for other routes
  next();
});

// Add body parsing middleware with raw body capture for webhooks
app.use(express.json({ 
  limit: '50mb',
  verify: (req, res, buf, encoding) => {
    // Capture raw body for webhook signature verification
    if (req.url && req.url.includes('/webhook')) {
      (req as any).rawBody = buf.toString((encoding as BufferEncoding) || 'utf8');
    }
  }
}));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Redirect uploaded files to Cloudflare R2 (zero egress fees!)
app.use(r2RedirectMiddleware);

// Serve attached assets statically (development only)
app.use('/attached_assets', express.static('attached_assets'));

// Add location detection middleware for geo-targeting ads
app.use(locationDetectionMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      
      // Don't log file upload responses in detail to avoid binary data corruption
      if (capturedJsonResponse && !path.includes('/logo')) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      } else if (capturedJsonResponse && path.includes('/logo')) {
        logLine += ` :: { success: ${capturedJsonResponse.success}, type: "${capturedJsonResponse.type}" }`;
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
  console.log('🔧 [STARTUP] Starting async initialization...');
  const server = await registerRoutes(app);
  console.log('🔧 [STARTUP] registerRoutes completed');
  
  // Register email routes
  registerEmailRoutes(app);
  
  // Seed email marketing templates
  try {
    await seedEmailTemplates();
    console.log('✅ Email marketing templates seeded');
  } catch (error) {
    console.error('❌ Email template seeding failed:', error);
  }
  
  // Seed email marketing segments
  try {
    await seedEmailSegments();
    console.log('✅ Email marketing segments seeded');
  } catch (error) {
    console.error('❌ Email segment seeding failed:', error);
  }
  
  // Setup WebSocket server with error handling
  try {
    const wss = setupWebSocket(server);
    console.log('✅ WebSocket server setup complete');
  } catch (error) {
    console.error('❌ WebSocket setup failed:', error);
    console.log('⚠️ Server will continue without WebSocket support');
  }

  // Start email auto-sync - DISABLED to reduce database egress
  // Users can manually sync emails from the email management page
  // try {
  //   emailService.startAutoSync();
  //   console.log('✅ Email auto-sync started');
  // } catch (error) {
  //   console.error('❌ Email auto-sync failed to start:', error);
  // }
  console.log('📧 Email auto-sync is DISABLED to reduce database costs. Use manual sync instead.');

  // Monthly settlement cron job - runs on the 5th of every month
  try {
    const { processMonthlySettlementForAll } = await import('./services/earnings.js');
    
    // Track last settlement run date to prevent duplicates
    let lastSettlementDate: string | null = null;
    
    const runSettlementCheck = async () => {
      const now = new Date();
      const dayOfMonth = now.getDate();
      const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${dayOfMonth}`;
      
      // Run on the 5th of each month, but only once per day
      if (dayOfMonth === 5 && lastSettlementDate !== todayKey) {
        console.log('🗓️  Running monthly settlement for all creators (5th of month)...');
        try {
          await processMonthlySettlementForAll();
          lastSettlementDate = todayKey; // Mark as run for today
          console.log('✅ Monthly settlement completed successfully');
        } catch (error) {
          console.error('❌ Monthly settlement failed:', error);
        }
      }
    };
    
    // Run immediately on startup (in case we're on the 5th)
    await runSettlementCheck();
    
    // Then check every hour
    setInterval(runSettlementCheck, 60 * 60 * 1000);
    console.log('✅ Monthly settlement scheduler started (runs on 5th of each month)');
  } catch (error) {
    console.error('❌ Monthly settlement scheduler failed to start:', error);
  }

  // Payout automation scheduler - creates and finalizes payouts
  try {
    const { initializePayoutScheduler } = await import('./services/payout-automation.js');
    initializePayoutScheduler();
    console.log('✅ Payout automation scheduler started');
  } catch (error) {
    console.error('❌ Payout automation scheduler failed to start:', error);
  }

  // Meeting notification scheduler - DISABLED to reduce database egress
  // Users can manually send notifications or we can enable this selectively
  // try {
  //   const { initializeMeetingNotificationScheduler } = await import('./meeting-notifications.js');
  //   initializeMeetingNotificationScheduler();
  //   console.log('✅ Meeting notification scheduler started');
  // } catch (error) {
  //   console.error('❌ Meeting notification scheduler failed to start:', error);
  // }
  console.log('🔔 Meeting notification scheduler is DISABLED to reduce database costs.');

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    console.log('🔧 [STARTUP] Setting up static file serving for production...');
    try {
      serveStatic(app);
      console.log('✅ [STARTUP] Static file serving configured');
    } catch (err) {
      console.error('❌ [STARTUP] Static file serving failed:', err);
      throw err;
    }
  }

  // Error handler must be registered LAST, after all routes and middleware including Vite
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error('Server error:', err);
    res.status(status).json({ message });
  });

  // Use PORT environment variable for deployment platforms
  // Railway/Render provide dynamic ports via process.env.PORT
  const port = parseInt(process.env.PORT || "5000");
  
  server.on('error', (err: any) => {
    console.error('❌ Server listen error:', err);
    // DO NOT exit - let keep-alive keep process running for debugging
    console.log('🔒 [KEEP-ALIVE] Server error occurred but process will stay alive');
  });
  
  server.listen(port, "0.0.0.0", () => {
    log(`✅ Server successfully listening on port ${port}`);
    console.log('🔧 [STARTUP] Server listening, process will stay alive');
  });
  
  // Keep the process alive using setInterval (more reliable than empty Promise)
  console.log('🔧 [STARTUP] Setting up keep-alive interval...');
  setInterval(() => {
    // This keeps Node.js event loop active
  }, 1000 * 60 * 60); // Every hour
  
  console.log('🔧 [STARTUP] Initialization complete, server running');
})().catch((err) => {
  console.error('❌ [STARTUP] Fatal async error:', err);
  console.error('❌ [STARTUP] Error details:', err instanceof Error ? err.message : String(err));
  // DO NOT exit - keep process alive so keep-alive interval keeps it running
  console.log('🔒 [KEEP-ALIVE] Process will continue despite initialization error');
});

// Fallback keep-alive at module level - CRITICAL FOR PRODUCTION
setInterval(() => {}, 1000 * 60 * 60);
