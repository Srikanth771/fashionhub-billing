const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { seedDatabase } = require('./utils/seedData');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB Database
connectDB().then(() => {
  // Auto-seed default admin & products if database is fresh
  seedDatabase();
});

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check & Store Info API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    store: process.env.SHOP_NAME || 'The Fashion Hub',
    time: new Date().toISOString(),
  });
});

// In-memory runtime settings initialized from env
let runtimeSettings = {
  shopName: process.env.SHOP_NAME || 'The Fashion Hub',
  phone: process.env.SHOP_PHONE || '6309382716',
  address:
    process.env.SHOP_ADDRESS ||
    'New Jewewllary Market, Kamala Theatre Road, Bhainsa 504103',
  logoUrl: process.env.SHOP_LOGO_URL || '',
  currency: '₹',
  tagline: "Men's Luxury Wear & Bespoke Tailoring",
  gstin: '36AAAAA0000A1Z5',
  terms: 'Goods once sold cannot be refunded. Exchange within 7 days with bill.',
  whatsappGateway: process.env.WHATSAPP_GATEWAY || 'ultramsg',
  whatsappInstanceId: process.env.WHATSAPP_INSTANCE_ID || '',
  whatsappToken: process.env.WHATSAPP_TOKEN || '',
  whatsappWebhookUrl: process.env.WHATSAPP_WEBHOOK_URL || '',
};

// Shop Settings & Metadata (Used by Receipt & WhatsApp generation)
app.get('/api/settings', (req, res) => {
  res.json({
    success: true,
    settings: runtimeSettings,
  });
});

app.post('/api/settings', (req, res) => {
  runtimeSettings = { ...runtimeSettings, ...req.body };
  if (req.body.whatsappInstanceId !== undefined) process.env.WHATSAPP_INSTANCE_ID = req.body.whatsappInstanceId;
  if (req.body.whatsappToken !== undefined) process.env.WHATSAPP_TOKEN = req.body.whatsappToken;
  if (req.body.whatsappWebhookUrl !== undefined) process.env.WHATSAPP_WEBHOOK_URL = req.body.whatsappWebhookUrl;
  res.json({
    success: true,
    message: 'Settings updated successfully',
    settings: runtimeSettings,
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  THE FASHION HUB - Men's Wear POS Server`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});
