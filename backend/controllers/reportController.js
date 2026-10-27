const Bill = require('../models/Bill');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc    Get dashboard metrics (Today, Week, Month totals, category quantities, recent bills)
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    // Start of Today (00:00:00)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of Week (Sunday or Monday, let's take 7 days ago)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    // Start of Current Month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Today's metrics (Completed bills only)
    const todayBills = await Bill.find({
      createdAt: { $gte: todayStart },
      status: 'Completed',
    });

    const todaySales = todayBills.reduce((acc, b) => acc + b.grandTotal, 0);
    const todayBillCount = todayBills.length;
    const todayItemsSold = todayBills.reduce(
      (acc, b) => acc + b.items.reduce((sum, item) => sum + item.quantity, 0),
      0
    );

    // 2. Weekly Sales
    const weeklyBills = await Bill.find({
      createdAt: { $gte: weekStart },
      status: 'Completed',
    });
    const weeklySales = weeklyBills.reduce((acc, b) => acc + b.grandTotal, 0);

    // 3. Monthly Sales
    const monthlyBills = await Bill.find({
      createdAt: { $gte: monthStart },
      status: 'Completed',
    });
    const monthlySales = monthlyBills.reduce((acc, b) => acc + b.grandTotal, 0);

    // 4. Last 7 Days Daily Breakdown for Chart
    const dailyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayBills = await Bill.find({
        createdAt: { $gte: dayStart, $lte: dayEnd },
        status: 'Completed',
      });

      const dayTotal = dayBills.reduce((acc, b) => acc + b.grandTotal, 0);
      const dayName = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

      dailyBreakdown.push({
        day: dayName,
        date: d.toISOString().split('T')[0],
        sales: dayTotal,
        bills: dayBills.length,
      });
    }

    // 5. Category-wise quantity sold (from all completed bills this month)
    const categoryQuantities = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
          status: 'Completed',
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          quantity: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.total' },
        },
      },
      { $sort: { quantity: -1 } },
    ]);

    // 6. Payment method breakdown
    const paymentBreakdown = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
          status: 'Completed',
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$grandTotal' },
        },
      },
    ]);

    // 7. Inventory stats & Low Stock Alerts
    const totalProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStockAlert'] },
    }).limit(10);

    // 8. Recent 10 Bills
    const recentBills = await Bill.find().sort({ createdAt: -1 }).limit(10);

    // 9. Customers stats
    const totalCustomers = await Customer.countDocuments();
    const recentCustomers = await Customer.find().sort({ lastBillDate: -1 }).limit(10);

    res.json({
      success: true,
      metrics: {
        todaySales,
        todayBillCount,
        todayItemsSold,
        weeklySales,
        monthlySales,
        totalProducts,
        lowStockCount: lowStockProducts.length,
        totalCustomers,
      },
      dailyBreakdown,
      categoryQuantities,
      paymentBreakdown,
      lowStockProducts,
      recentBills,
      recentCustomers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get custom date range sales report
// @route   GET /api/reports/sales
// @access  Private
const getCustomSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const bills = await Bill.find({
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 });

    const completedBills = bills.filter(b => b.status === 'Completed');
    const refundedBills = bills.filter(b => b.status === 'Refunded');

    const totalGross = completedBills.reduce((acc, b) => acc + b.subtotal, 0);
    const totalDiscounts = completedBills.reduce((acc, b) => acc + b.discountAmount, 0);
    const totalGst = completedBills.reduce((acc, b) => acc + b.gstAmount, 0);
    const totalNetRevenue = completedBills.reduce((acc, b) => acc + b.grandTotal, 0);
    const refundedRevenue = refundedBills.reduce((acc, b) => acc + b.grandTotal, 0);

    res.json({
      success: true,
      summary: {
        totalBills: bills.length,
        completedBills: completedBills.length,
        refundedBills: refundedBills.length,
        totalGross,
        totalDiscounts,
        totalGst,
        totalNetRevenue,
        refundedRevenue,
        dateRange: { start, end },
      },
      bills,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getCustomSalesReport,
};
