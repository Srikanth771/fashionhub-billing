const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const Counter = require('../models/Counter');

// @desc    Get all customers with search and pagination
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query).sort({ lastBillDate: -1 });
    res.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer purchase history
// @route   GET /api/customers/:phone/history
// @access  Private
const getCustomerHistory = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const customer = await Customer.findOne({ phone });
    const bills = await Bill.find({ customerPhone: phone }).sort({ createdAt: -1 });

    res.json({
      success: true,
      customer: customer || { name: 'Unknown Customer', phone },
      bills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a single customer by ID
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    res.json({ success: true, message: `Customer "${customer.name}" deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

// @desc    Send WhatsApp offer message to selected customers
// @route   POST /api/customers/send-offer
// @access  Private
const sendOfferToCustomers = async (req, res, next) => {
  try {
    const { offerText, customerIds, sendToAll } = req.body;

    if (!offerText || !offerText.trim()) {
      return res.status(400).json({ success: false, message: 'Offer message text is required.' });
    }

    let customers = [];
    if (sendToAll) {
      customers = await Customer.find({});
    } else if (customerIds && customerIds.length > 0) {
      customers = await Customer.find({ _id: { $in: customerIds } });
    }

    if (customers.length === 0) {
      return res.status(400).json({ success: false, message: 'No customers selected to send offer.' });
    }

    const instanceId = process.env.WHATSAPP_INSTANCE_ID;
    const token = process.env.WHATSAPP_TOKEN;
    const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;
    const shopName = process.env.SHOP_NAME || 'The Fashion Hub';

    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    const formattedMessage = `✨ *${shopName.toUpperCase()}* ✨\n\n${offerText.trim()}\n\n🙏 Thank you for shopping with us!\n_Visit us again for exclusive deals._`;

    for (const customer of customers) {
      const rawPhone = customer.phone?.replace(/[^0-9]/g, '');
      if (!rawPhone || rawPhone.length < 10) {
        failedCount++;
        results.push({ name: customer.name, phone: customer.phone, status: 'failed', reason: 'Invalid phone number' });
        continue;
      }
      const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

      // Try UltraMsg gateway
      if (instanceId && token) {
        try {
          const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ token, to: `+${cleanPhone}`, body: formattedMessage }),
          });
          const result = await response.json();
          if (result.sent === 'true' || result.id) {
            sentCount++;
            results.push({ name: customer.name, phone: customer.phone, status: 'sent' });
          } else {
            failedCount++;
            results.push({ name: customer.name, phone: customer.phone, status: 'failed', reason: JSON.stringify(result) });
          }
        } catch (err) {
          failedCount++;
          results.push({ name: customer.name, phone: customer.phone, status: 'failed', reason: err.message });
        }
        // small delay to avoid rate-limiting
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }

      // Try webhook
      if (webhookUrl) {
        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: cleanPhone, message: formattedMessage, customerName: customer.name }),
          });
          const result = await response.json();
          sentCount++;
          results.push({ name: customer.name, phone: customer.phone, status: 'sent', result });
        } catch (err) {
          failedCount++;
          results.push({ name: customer.name, phone: customer.phone, status: 'failed', reason: err.message });
        }
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }

      // No gateway — generate wa.me links
      results.push({
        name: customer.name,
        phone: customer.phone,
        cleanPhone,
        status: 'link_only',
        waLink: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(formattedMessage)}`,
      });
      sentCount++;
    }

    const gatewayNotConfigured = !instanceId && !token && !webhookUrl;

    res.json({
      success: true,
      gatewayNotConfigured,
      totalCustomers: customers.length,
      sentCount,
      failedCount,
      results,
      formattedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear ALL bills, customers & counter from DB (Fresh start)
// @route   DELETE /api/customers/clear-all-data
// @access  Private (Admin only)
const clearAllData = async (req, res, next) => {
  try {
    const { confirmText } = req.body;
    if (confirmText !== 'DELETE ALL DATA') {
      return res.status(400).json({
        success: false,
        message: 'Confirmation text mismatch. Send { confirmText: "DELETE ALL DATA" } to confirm.',
      });
    }

    const billResult = await Bill.deleteMany({});
    const customerResult = await Customer.deleteMany({});
    await Counter.deleteMany({});
    // Re-initialize counter
    await Counter.create({ id: 'TFH-2610', seq: 1000 });

    res.json({
      success: true,
      message: 'All bills and customers have been permanently deleted. Counter reset to 1000.',
      deletedBills: billResult.deletedCount,
      deletedCustomers: customerResult.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerHistory,
  deleteCustomer,
  sendOfferToCustomers,
  clearAllData,
};
