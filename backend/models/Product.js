const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      default: 'The Fashion Hub',
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      index: true,
    },
    sku: {
      type: String,
      trim: true,
      index: true,
    },
    size: {
      type: String,
      required: [true, 'Size is required'],
      trim: true,
    },
    color: {
      type: String,
      trim: true,
      default: 'Assorted',
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    mrp: {
      type: Number,
      default: 0,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      default: 0,
      min: 0,
    },
    minStockAlert: {
      type: Number,
      default: 5,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for low stock warning
productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.minStockAlert;
});

module.exports = mongoose.model('Product', productSchema);
