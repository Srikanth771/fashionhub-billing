const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const generateBillNumber = require('../utils/generateBillNumber');
const { sendWhatsAppInvoice } = require('../services/whatsappService');

// @desc    Create and save new bill (Atomic stock reduction & unique invoice number)
// @route   POST /api/bills
// @access  Private
const createBill = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      items,
      discountType,
      discountValue,
      gstPercentage,
      paymentMethod,
      cashReceived,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A bill must have at least one product item.',
      });
    }

    // 1. Verify item availability and calculate subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.name || !item.price || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a name, price, and positive quantity.',
        });
      }

      const qty = Number(item.quantity);
      const price = Number(item.price);
      const itemTotal = Math.round(qty * price * 100) / 100;
      subtotal += itemTotal;

      // Check stock if productId is linked
      if (item.productId) {
        const product = await Product.findById(item.productId);
        if (product && product.stock < qty) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for "${product.name}" (${product.size}). Available: ${product.stock}, Requested: ${qty}.`,
          });
        }
      }

      validatedItems.push({
        productId: item.productId || null,
        name: item.name,
        category: item.category || 'General',
        size: item.size || 'Standard',
        barcode: item.barcode || '',
        price,
        quantity: qty,
        total: itemTotal,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;

    // 2. Calculate discounts
    const discVal = Number(discountValue) || 0;
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = Math.round((subtotal * discVal) / 100 * 100) / 100;
    } else {
      discountAmount = Math.min(discVal, subtotal);
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);

    // 3. Calculate GST
    const gstPct = Number(gstPercentage) || 0;
    const gstAmount = Math.round((taxableAmount * gstPct) / 100 * 100) / 100;

    // 4. Calculate Grand Total & Round Off
    const rawTotal = taxableAmount + gstAmount;
    const grandTotal = Math.round(rawTotal);
    const roundOff = Math.round((grandTotal - rawTotal) * 100) / 100;

    // 5. Calculate change if cash payment
    const received = Number(cashReceived) || (paymentMethod === 'Cash' ? grandTotal : 0);
    const change = Math.max(0, received - grandTotal);

    // 6. Generate sequential unique bill number
    const billNumber = await generateBillNumber();

    // 7. Atomically decrement stock in database if product is catalog linked
    for (const item of validatedItems) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    // 8. Save bill record
    const bill = await Bill.create({
      billNumber,
      customerName: customerName ? customerName.trim() : 'Walk-in Customer',
      customerPhone: customerPhone ? customerPhone.trim() : '',
      items: validatedItems,
      subtotal,
      discountType: discountType || 'flat',
      discountValue: discVal,
      discountAmount,
      gstPercentage: gstPct,
      gstAmount,
      roundOff,
      grandTotal,
      paymentMethod: paymentMethod || 'Cash',
      cashReceived: received,
      changeReturned: change,
      cashierName: req.user ? req.user.name : 'Store Owner',
      cashierId: req.user ? req.user._id : null,
      status: 'Completed',
      notes: notes || '',
    });

    // 9. Save / Upsert Customer in Database for Customer Management
    if (customerPhone && customerPhone.trim().length >= 10) {
      const cleanPhone = customerPhone.trim();
      const cleanName = customerName ? customerName.trim() : 'Valued Customer';
      await Customer.findOneAndUpdate(
        { phone: cleanPhone },
        {
          $set: {
            name: cleanName,
            lastBillNumber: billNumber,
            lastBillDate: new Date(),
          },
          $inc: {
            billsCount: 1,
            totalSpend: grandTotal,
          },
        },
        { upsert: true, new: true }
      );
    }

    // 10. Automated WhatsApp Dispatch in Background (No manual click required)
    let whatsappResult = null;
    if (customerPhone && customerPhone.trim().length >= 10) {
      whatsappResult = await sendWhatsAppInvoice(bill);
    }

    res.status(201).json({
      success: true,
      message: 'Bill created and customer updated successfully',
      bill,
      whatsapp: whatsappResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bills with filtering and pagination
// @route   GET /api/bills
// @access  Private
const getBills = async (req, res, next) => {
  try {
    const { search, paymentMethod, status, startDate, endDate, limit = 50, page = 1 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { billNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalCount = await Bill.countDocuments(query);
    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: bills.length,
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      bills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bill by ID or Bill Number
// @route   GET /api/bills/:identifier
// @access  Private
const getBillById = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    let bill;

    // Check if valid ObjectId or billNumber
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      bill = await Bill.findById(identifier);
    } else {
      bill = await Bill.findOne({ billNumber: identifier });
    }

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};

// @desc    Refund or Cancel Bill (Restores inventory stock)
// @route   PATCH /api/bills/:id/status
// @access  Private/Admin
const updateBillStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;

    if (!['Refunded', 'Cancelled', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid bill status' });
    }

    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const previousStatus = bill.status;

    // If changing from Completed -> Refunded/Cancelled, restore product stock
    if (previousStatus === 'Completed' && (status === 'Refunded' || status === 'Cancelled')) {
      for (const item of bill.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    // If changing from Refunded/Cancelled back -> Completed, decrement stock again
    if ((previousStatus === 'Refunded' || previousStatus === 'Cancelled') && status === 'Completed') {
      for (const item of bill.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity },
          });
        }
      }
    }

    bill.status = status;
    if (reason) {
      bill.notes = bill.notes ? `${bill.notes} | ${status}: ${reason}` : `${status}: ${reason}`;
    }
    await bill.save();

    res.json({
      success: true,
      message: `Bill marked as ${status}. Inventory has been synchronized.`,
      bill,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBill,
  getBills,
  getBillById,
  updateBillStatus,
};
