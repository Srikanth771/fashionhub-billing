const Product = require('../models/Product');

// @desc    Get all products with search, category & stock filters
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const { search, category, stockStatus, sort } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (stockStatus === 'low') {
      query.$expr = { $lte: ['$stock', '$minStockAlert'] };
    } else if (stockStatus === 'out') {
      query.stock = 0;
    } else if (stockStatus === 'in') {
      query.stock = { $gt: 0 };
    }

    let sortOptions = { updatedAt: -1 };
    if (sort === 'name_asc') sortOptions = { name: 1 };
    if (sort === 'price_asc') sortOptions = { sellingPrice: 1 };
    if (sort === 'price_desc') sortOptions = { sellingPrice: -1 };
    if (sort === 'stock_asc') sortOptions = { stock: 1 };

    const products = await Product.find(query).sort(sortOptions);
    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Find product by exact barcode (for fast scanner in POS)
// @route   GET /api/products/barcode/:barcode
// @access  Private
const getProductByBarcode = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      barcode: req.params.barcode.trim(),
      isActive: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'No product matches this barcode' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      category,
      brand,
      barcode,
      sku,
      size,
      color,
      costPrice,
      mrp,
      sellingPrice,
      stock,
      minStockAlert,
      description,
    } = req.body;

    // Check duplicate barcode if provided
    if (barcode) {
      const existing = await Product.findOne({ barcode: barcode.trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `A product with barcode "${barcode}" already exists (${existing.name}).`,
        });
      }
    }

    const product = await Product.create({
      name,
      category,
      brand: brand || 'The Fashion Hub',
      barcode: barcode ? barcode.trim() : `BAR-${Date.now().toString().slice(-6)}`,
      sku: sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      size,
      color: color || 'Assorted',
      costPrice: Number(costPrice) || 0,
      mrp: Number(mrp) || Number(sellingPrice) || 0,
      sellingPrice: Number(sellingPrice),
      stock: Number(stock) || 0,
      minStockAlert: Number(minStockAlert) || 5,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.body.barcode && req.body.barcode !== product.barcode) {
      const existing = await Product.findOne({
        barcode: req.body.barcode.trim(),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another product already uses this barcode',
        });
      }
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Soft delete to protect bill history integrity
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product archived successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick adjust stock (increase/decrease)
// @route   PATCH /api/products/:id/stock
// @access  Private
const adjustStock = async (req, res, next) => {
  try {
    const { adjustment, reason } = req.body;
    const qty = Number(adjustment);

    if (isNaN(qty)) {
      return res.status(400).json({ success: false, message: 'Valid adjustment number required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock + qty < 0) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Current stock is ${product.stock}, cannot reduce by ${Math.abs(qty)}.`,
      });
    }

    product.stock += qty;
    await product.save();

    res.json({
      success: true,
      message: `Stock updated. Current stock is now ${product.stock}.`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories summary with counts
// @route   GET /api/products/meta/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getCategories,
};
