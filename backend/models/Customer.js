const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
      unique: true,
      index: true,
    },
    totalSpend: {
      type: Number,
      default: 0,
      min: 0,
    },
    billsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastBillNumber: {
      type: String,
      trim: true,
    },
    lastBillDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Customer', customerSchema);
