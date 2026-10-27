const Counter = require('../models/Counter');

/**
 * Generates an atomic sequential bill number
 * Format: TFH-YYMM-XXXX (e.g. TFH-2610-1001)
 */
const generateBillNumber = async () => {
  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `TFH-${year}${month}`;

  try {
    const counter = await Counter.findOneAndUpdate(
      { id: prefix },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    return `${prefix}-${String(counter.seq).padStart(4, '0')}`;
  } catch (error) {
    // Fallback timestamp-based bill number in rare edge case
    const fallbackSeq = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${fallbackSeq}`;
  }
};

module.exports = generateBillNumber;
