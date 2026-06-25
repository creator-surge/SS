import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("surge.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT CHECK(role IN ('user', 'creator', 'admin'))
  );

  CREATE TABLE IF NOT EXISTS creator_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    handle TEXT UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    location TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reels (
    id TEXT PRIMARY KEY,
    creator_id TEXT,
    video_url TEXT,
    caption TEXT,
    tags TEXT,
    is_shoppable INTEGER,
    linked_listing_id TEXT,
    FOREIGN KEY(creator_id) REFERENCES creator_profiles(id)
  );

  CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    creator_id TEXT,
    title TEXT,
    description TEXT,
    category TEXT CHECK(category IN ('digital', 'service', 'physical')),
    price REAL,
    media_urls TEXT,
    FOREIGN KEY(creator_id) REFERENCES creator_profiles(id)
  );

  CREATE TABLE IF NOT EXISTS audio_spaces (
    id TEXT PRIMARY KEY,
    host_creator_id TEXT,
    title TEXT,
    status TEXT CHECK(status IN ('scheduled', 'live', 'ended')),
    FOREIGN KEY(host_creator_id) REFERENCES creator_profiles(id)
  );

  CREATE TABLE IF NOT EXISTS geo_points (
    id TEXT PRIMARY KEY,
    creator_id TEXT,
    lat REAL,
    lng REAL,
    FOREIGN KEY(creator_id) REFERENCES creator_profiles(id)
  );

  CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('user', 'content', 'revenue', 'operational')),
    metric_name TEXT,
    metric_value REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    type TEXT CHECK(type IN ('system', 'activity', 'membership', 'staff')),
    title TEXT,
    message TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tiers (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE,
    price_id TEXT, -- Stripe Price ID
    features TEXT, -- JSON array
    monthly_price REAL
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    tier_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT CHECK(status IN ('active', 'past_due', 'canceled', 'incomplete')),
    current_period_end DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(tier_id) REFERENCES tiers(id)
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    category TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe Webhook - MUST be before express.json() for raw body access
  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey || !webhookSecret) {
      console.error("Stripe keys missing in environment");
      return res.status(500).send("Webhook Error: Missing configuration");
    }

    const stripe = new Stripe(stripeKey);
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as any;
          const status = subscription.status;
          const stripeSubscriptionId = subscription.id;
          const priceId = subscription.items.data[0].price.id;
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

          // Find tier by price_id
          const tier = db.prepare("SELECT id FROM tiers WHERE price_id = ?").get(priceId) as { id: string } | undefined;
          
          if (tier) {
            // In a real app, we'd find the user by stripe_customer_id
            // For this demo, we'll update the first user's subscription or create one
            const user = db.prepare("SELECT id FROM users LIMIT 1").get() as { id: string };
            
            db.prepare(`
              INSERT INTO subscriptions (id, user_id, tier_id, stripe_subscription_id, status, current_period_end)
              VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                status = excluded.status,
                current_period_end = excluded.current_period_end,
                tier_id = excluded.tier_id
            `).run(stripeSubscriptionId, user.id, tier.id, stripeSubscriptionId, status, currentPeriodEnd);

            console.log(`Subscription ${stripeSubscriptionId} updated to ${status}`);
          }
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as any;
          db.prepare("UPDATE subscriptions SET status = 'canceled' WHERE stripe_subscription_id = ?")
            .run(subscription.id);
          console.log(`Subscription ${subscription.id} canceled`);
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            db.prepare("UPDATE subscriptions SET status = 'past_due' WHERE stripe_subscription_id = ?")
              .run(invoice.subscription as string);
            console.log(`Payment failed for subscription ${invoice.subscription}`);
          }
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (dbErr: any) {
      console.error(`Database error processing webhook: ${dbErr.message}`);
      return res.status(500).send("Internal Server Error");
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mock Data Seed if empty
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    const userId = "u1";
    const creatorId = "c1";
    db.prepare("INSERT INTO users (id, email, role) VALUES (?, ?, ?)").run(userId, "creator@surge.com", "creator");
    db.prepare("INSERT INTO creator_profiles (id, user_id, handle, bio, avatar_url, location) VALUES (?, ?, ?, ?, ?, ?)")
      .run(creatorId, userId, "alex_surge", "Building the future of social commerce.", "https://picsum.photos/seed/alex/200", "London, UK");
    
    db.prepare("INSERT INTO reels (id, creator_id, video_url, caption, is_shoppable) VALUES (?, ?, ?, ?, ?)")
      .run("r1", creatorId, "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-dancing-40030-large.mp4", "New drop coming soon! 🚀", 1);
    
    db.prepare("INSERT INTO listings (id, creator_id, title, description, category, price) VALUES (?, ?, ?, ?, ?, ?)")
      .run("l1", creatorId, "Creator Masterclass", "Learn how to scale your brand.", "digital", 49.99);

    // Add more mock listings for lazy loading demo
    for (let i = 2; i <= 20; i++) {
      db.prepare("INSERT INTO listings (id, creator_id, title, description, category, price) VALUES (?, ?, ?, ?, ?, ?)")
        .run(`l${i}`, creatorId, `Product ${i}`, `Description for product ${i}`, i % 3 === 0 ? 'physical' : (i % 2 === 0 ? 'digital' : 'service'), 10 * i);
    }

    db.prepare("INSERT INTO geo_points (id, creator_id, lat, lng) VALUES (?, ?, ?, ?)")
      .run("g1", creatorId, 51.5074, -0.1278);

    // Seed Tiers
    const tiers = [
      { id: 't1', name: 'Free', price_id: null, features: JSON.stringify(['Baseline access', 'Limited features']), price: 0 },
      { id: 't2', name: 'Basic', price_id: 'price_basic', features: JSON.stringify(['Expanded access', 'Basic AI tools']), price: 9.99 },
      { id: 't3', name: 'Premium', price_id: 'price_premium', features: JSON.stringify(['Full feature set', 'Advanced AI tools']), price: 29.99 },
      { id: 't4', name: 'Elite', price_id: 'price_elite', features: JSON.stringify(['Highest access', 'Priority support', 'Experimental features']), price: 99.99 },
    ];
    const insertTier = db.prepare("INSERT INTO tiers (id, name, price_id, features, monthly_price) VALUES (?, ?, ?, ?, ?)");
    tiers.forEach(t => insertTier.run(t.id, t.name, t.price_id, t.features, t.price));

    // Seed Initial Analytics
    const seedAnalytics = [
      { id: 'a1', type: 'user', name: 'signups', value: 1240 },
      { id: 'a2', type: 'content', name: 'views', value: 45000 },
      { id: 'a3', type: 'revenue', name: 'mrr', value: 12500 },
      { id: 'a4', type: 'operational', name: 'tickets', value: 12 },
    ];
    const insertAnalytic = db.prepare("INSERT INTO analytics (id, type, metric_name, metric_value) VALUES (?, ?, ?, ?)");
    seedAnalytics.forEach(a => insertAnalytic.run(a.id, a.type, a.name, a.value));

    // Seed Settings
    const settings = [
      { key: 'platform_name', value: 'Creator Surge Studios', category: 'general' },
      { key: 'ai_enabled', value: 'true', category: 'ai' },
      { key: 'maintenance_mode', value: 'false', category: 'general' },
    ];
    const insertSetting = db.prepare("INSERT INTO system_settings (key, value, category) VALUES (?, ?, ?)");
    settings.forEach(s => insertSetting.run(s.key, s.value, s.category));

    // Seed Notifications
    const notifications = [
      { id: 'n1', user_id: 'u1', type: 'system', title: 'Welcome to Surge!', message: 'Your creator account is now active. Start building your empire!' },
      { id: 'n2', user_id: 'u1', type: 'activity', title: 'New Sale!', message: 'Someone just purchased your "Creator Masterclass".' },
      { id: 'n3', user_id: 'u1', type: 'membership', title: 'Tier Upgrade', message: 'You are now a Pro Creator with full access to AI tools.' },
    ];
    const insertNotification = db.prepare("INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, ?, ?, ?)");
    notifications.forEach(n => insertNotification.run(n.id, n.user_id, n.type, n.title, n.message));
  }

  // Creators
  app.get("/api/creators", (req, res) => {
    const creators = db.prepare(`
      SELECT cp.*, u.role 
      FROM creator_profiles cp 
      JOIN users u ON cp.user_id = u.id
    `).all();
    res.json(creators);
  });

  app.get("/api/creators/:handle", (req, res) => {
    const creator = db.prepare("SELECT * FROM creator_profiles WHERE handle = ?").get(req.params.handle);
    if (!creator) return res.status(404).json({ error: "Not found" });
    res.json(creator);
  });

  // Reels
  app.get("/api/reels", (req, res) => {
    const reels = db.prepare(`
      SELECT r.*, cp.handle, cp.avatar_url 
      FROM reels r 
      JOIN creator_profiles cp ON r.creator_id = cp.id
    `).all();
    res.json(reels);
  });

  // Marketplace
  app.get("/api/marketplace", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 8;
    const offset = parseInt(req.query.offset as string) || 0;
    const category = req.query.category as string;

    let query = `
      SELECT l.*, cp.handle 
      FROM listings l 
      JOIN creator_profiles cp ON l.creator_id = cp.id
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ` WHERE l.category = ?`;
      params.push(category);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const listings = db.prepare(query).all(...params);
    res.json(listings);
  });

  // Map
  app.get("/api/map/creators", (req, res) => {
    const points = db.prepare(`
      SELECT gp.*, cp.handle, cp.avatar_url 
      FROM geo_points gp 
      JOIN creator_profiles cp ON gp.creator_id = cp.id
    `).all();
    res.json(points);
  });

  // Spaces
  app.get("/api/spaces", (req, res) => {
    const spaces = db.prepare(`
      SELECT s.*, cp.handle 
      FROM audio_spaces s 
      JOIN creator_profiles cp ON s.host_creator_id = cp.id
      WHERE status = 'live'
    `).all();
    res.json(spaces);
  });

  // Analytics
  app.get("/api/analytics", (req, res) => {
    const data = db.prepare("SELECT * FROM analytics ORDER BY timestamp DESC").all();
    res.json(data);
  });

  // Notifications
  app.get("/api/notifications", (req, res) => {
    // In a real app, we'd filter by user_id from session
    const data = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC").all();
    res.json(data);
  });

  app.post("/api/notifications/:id/read", (req, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Membership & Payments
  app.get("/api/membership/tiers", (req, res) => {
    const data = db.prepare("SELECT * FROM tiers").all();
    res.json(data.map((t: any) => ({ ...t, features: JSON.parse(t.features) })));
  });

  app.get("/api/membership/status", (req, res) => {
    // Mocking current user subscription
    const sub = db.prepare(`
      SELECT s.*, t.name as tier_name, t.features
      FROM subscriptions s
      JOIN tiers t ON s.tier_id = t.id
      LIMIT 1
    `).get();
    res.json(sub || { tier_name: 'Free', status: 'active' });
  });

  // System Settings
  app.get("/api/settings", (req, res) => {
    const data = db.prepare("SELECT * FROM system_settings").all();
    res.json(data);
  });

  app.post("/api/settings", (req, res) => {
    const { key, value } = req.body;
    db.prepare("INSERT OR REPLACE INTO system_settings (key, value, category) VALUES (?, ?, (SELECT category FROM system_settings WHERE key = ?))")
      .run(key, value, key);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
