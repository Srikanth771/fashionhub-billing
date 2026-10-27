const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Counter = require('../models/Counter');

const sampleProducts = [
  // Formal Shirts
  {
    name: 'Executive Egyptian Cotton Formal Shirt',
    category: 'Formal Shirts',
    brand: 'The Fashion Hub',
    barcode: '8901001',
    sku: 'TFH-SH-01',
    size: '40',
    color: 'Crisp White',
    costPrice: 650,
    mrp: 1899,
    sellingPrice: 1399,
    stock: 24,
    minStockAlert: 5,
    description: '100% Giza Cotton luxury formal shirt with french cuff.',
  },
  {
    name: 'Royal Oxford Blue Formal Shirt',
    category: 'Formal Shirts',
    brand: 'The Fashion Hub',
    barcode: '8901002',
    sku: 'TFH-SH-02',
    size: '42',
    color: 'Sky Blue',
    costPrice: 580,
    mrp: 1699,
    sellingPrice: 1249,
    stock: 18,
    minStockAlert: 4,
    description: 'Wrinkle-resistant pinpoint oxford weave.',
  },
  {
    name: 'Tailored Fit Micro-Check Shirt',
    category: 'Formal Shirts',
    brand: 'The Fashion Hub',
    barcode: '8901003',
    sku: 'TFH-SH-03',
    size: '38',
    color: 'Navy Grid',
    costPrice: 520,
    mrp: 1599,
    sellingPrice: 1199,
    stock: 4, // low stock alert demo
    minStockAlert: 5,
    description: 'Spread collar modern business shirt.',
  },

  // Casual Shirts
  {
    name: 'Pure Linen Mandarin Collar Shirt',
    category: 'Casual Shirts',
    brand: 'The Fashion Hub',
    barcode: '8901004',
    sku: 'TFH-CS-01',
    size: 'L',
    color: 'Beige Olive',
    costPrice: 700,
    mrp: 2199,
    sellingPrice: 1599,
    stock: 15,
    minStockAlert: 4,
    description: 'Breathable 100% European flax linen shirt.',
  },
  {
    name: 'Vintage Washed Denim Shirt',
    category: 'Casual Shirts',
    brand: 'The Fashion Hub',
    barcode: '8901005',
    sku: 'TFH-CS-02',
    size: 'M',
    color: 'Indigo Indigo',
    costPrice: 620,
    mrp: 1899,
    sellingPrice: 1399,
    stock: 12,
    minStockAlert: 3,
    description: 'Soft-touch stone washed lightweight casual denim.',
  },

  // Trousers & Chinos
  {
    name: 'Super 120s Wool Blend Formal Trouser',
    category: 'Trousers',
    brand: 'The Fashion Hub',
    barcode: '8901006',
    sku: 'TFH-TR-01',
    size: '32',
    color: 'Charcoal Grey',
    costPrice: 750,
    mrp: 2499,
    sellingPrice: 1799,
    stock: 16,
    minStockAlert: 4,
    description: 'Pleat-front luxury business trousers with stretch.',
  },
  {
    name: 'Flexi-Waist Stretch Cotton Chino',
    category: 'Trousers',
    brand: 'The Fashion Hub',
    barcode: '8901007',
    sku: 'TFH-TR-02',
    size: '34',
    color: 'Khaki Sand',
    costPrice: 600,
    mrp: 1999,
    sellingPrice: 1449,
    stock: 20,
    minStockAlert: 5,
    description: 'Sateen finish 4-way stretch smart chino trousers.',
  },

  // Jeans
  {
    name: 'Selvedge Raw Indigo Slim Tapered Jeans',
    category: 'Jeans',
    brand: 'The Fashion Hub',
    barcode: '8901008',
    sku: 'TFH-JN-01',
    size: '32',
    color: 'Dark Navy',
    costPrice: 850,
    mrp: 2999,
    sellingPrice: 2199,
    stock: 14,
    minStockAlert: 4,
    description: 'Heavyweight premium ring-spun cotton denim.',
  },
  {
    name: 'Mid-Wash Athletic Stretch Jeans',
    category: 'Jeans',
    brand: 'The Fashion Hub',
    barcode: '8901009',
    sku: 'TFH-JN-02',
    size: '36',
    color: 'Vintage Blue',
    costPrice: 750,
    mrp: 2599,
    sellingPrice: 1899,
    stock: 2, // low stock alert demo
    minStockAlert: 5,
    description: 'Ultra-flexible comfort stretch 5-pocket denim.',
  },

  // Suits & Blazers
  {
    name: 'Italian Cut Midnight Navy Tuxedo Blazer',
    category: 'Suits & Blazers',
    brand: 'The Fashion Hub',
    barcode: '8901010',
    sku: 'TFH-BL-01',
    size: '40R',
    color: 'Midnight Navy',
    costPrice: 2400,
    mrp: 8999,
    sellingPrice: 5999,
    stock: 8,
    minStockAlert: 2,
    description: 'Satin shawl lapel single-breasted dinner jacket.',
  },
  {
    name: 'Classic Tweed Textured Winter Blazer',
    category: 'Suits & Blazers',
    brand: 'The Fashion Hub',
    barcode: '8901011',
    sku: 'TFH-BL-02',
    size: '42R',
    color: 'Mocha Brown',
    costPrice: 2100,
    mrp: 7499,
    sellingPrice: 4999,
    stock: 6,
    minStockAlert: 2,
    description: 'Notch lapel elbow patch heritage casual blazer.',
  },

  // Kurta & Ethnic Wear
  {
    name: 'Embroidered Silk Blend Festive Kurta Set',
    category: 'Kurta & Ethnic',
    brand: 'The Fashion Hub',
    barcode: '8901012',
    sku: 'TFH-EK-01',
    size: '40',
    color: 'Imperial Gold',
    costPrice: 1100,
    mrp: 3999,
    sellingPrice: 2899,
    stock: 10,
    minStockAlert: 3,
    description: 'Intricate thread work with matching churidar.',
  },

  // Accessories
  {
    name: 'Full Grain Reversible Leather Belt',
    category: 'Accessories',
    brand: 'The Fashion Hub',
    barcode: '8901013',
    sku: 'TFH-AC-01',
    size: 'Free Size',
    color: 'Black/Brown',
    costPrice: 320,
    mrp: 1299,
    sellingPrice: 799,
    stock: 35,
    minStockAlert: 8,
    description: 'Genuine leather dual-tone rotating brass buckle.',
  },
  {
    name: 'Handcrafted Micro-Jacquard Pure Silk Tie',
    category: 'Accessories',
    brand: 'The Fashion Hub',
    barcode: '8901014',
    sku: 'TFH-AC-02',
    size: 'Standard',
    color: 'Gold Navy Motif',
    costPrice: 220,
    mrp: 999,
    sellingPrice: 599,
    stock: 28,
    minStockAlert: 6,
    description: 'Premium woven jacquard necktie with gift box.',
  },
];

const seedDatabase = async () => {
  try {
    console.log('[Seed] Checking database collections...');

    // 1. Seed Admin User
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create({
        name: 'Store Owner',
        username: 'admin',
        password: 'admin123',
        email: 'owner@fashionhub.com',
        role: 'admin',
        phone: process.env.SHOP_PHONE || '6309382716',
      });
      await User.create({
        name: 'Cashier Staff',
        username: 'cashier',
        password: 'cashier123',
        email: 'cashier@fashionhub.com',
        role: 'cashier',
        phone: '9876543210',
      });
      console.log('[Seed] Created default admin (admin/admin123) and cashier (cashier/cashier123).');
    }

    // 2. Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(sampleProducts);
      console.log(`[Seed] Seeded ${sampleProducts.length} premium menswear products.`);
    }

    // 3. Initialize Bill Counter
    const counterCount = await Counter.countDocuments();
    if (counterCount === 0) {
      await Counter.create({ id: 'TFH-2610', seq: 1000 });
      console.log('[Seed] Initialized invoice sequence counter.');
    }
  } catch (error) {
    console.error('[Seed Error]:', error.message);
  }
};

module.exports = { seedDatabase, sampleProducts };
