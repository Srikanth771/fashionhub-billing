/**
 * Automated WhatsApp Service
 * Sends digital invoice directly to customer's WhatsApp without manual clicks
 * Supports: UltraMsg, Meta WhatsApp Cloud API, and Custom Webhooks
 */

const sendWhatsAppInvoice = async (bill, settings) => {
  const phone = bill.customerPhone?.replace(/[^0-9]/g, '');
  if (!phone || phone.length < 10) {
    return { success: false, reason: 'Invalid customer phone number' };
  }

  const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

  // Format message text
  const shopName = settings?.shopName || process.env.SHOP_NAME || 'The Fashion Hub';
  const tagline = settings?.tagline || "Men's Luxury Wear & Exclusive Collection";
  const address = settings?.address || process.env.SHOP_ADDRESS || '';
  const shopPhone = settings?.phone || process.env.SHOP_PHONE || '';

  const formattedDate = new Date(bill.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const itemsSummary = bill.items
    ?.map(
      (item, idx) =>
        `${idx + 1}. *${item.name}* (${item.size})\n   Qty: ${item.quantity} x ₹${item.price} = *₹${item.total}*`
    )
    .join('\n');

  let text = `✨ *${shopName.toUpperCase()}* ✨\n`;
  text += `_${tagline}_\n`;
  if (address) text += `📍 ${address}\n`;
  if (shopPhone) text += `📞 Support: +91 ${shopPhone}\n`;
  text += `------------------------------------\n`;
  text += `🧾 *INVOICE: #${bill.billNumber}*\n`;
  text += `📅 Date: ${formattedDate}\n`;
  text += `👤 Customer: ${bill.customerName || 'Valued Customer'}\n`;
  text += `💳 Mode: *${bill.paymentMethod}*\n`;
  text += `------------------------------------\n`;
  text += `*PURCHASED ITEMS:*\n${itemsSummary}\n`;
  text += `------------------------------------\n`;
  text += `Subtotal: ₹${bill.subtotal?.toFixed(2)}\n`;

  if (bill.discountAmount > 0) {
    text += `Discount: -₹${bill.discountAmount?.toFixed(2)}\n`;
  }

  text += `\n💰 *GRAND TOTAL: ₹${bill.grandTotal?.toFixed(2)}*\n`;
  text += `------------------------------------\n`;
  text += `🙏 *Thank you for shopping at ${shopName}! VISIT AGAIN.*\n`;
  text += `_Note: Exchange within 7 days with this digital invoice._`;

  const gateway = process.env.WHATSAPP_GATEWAY || 'ultramsg';
  const instanceId = process.env.WHATSAPP_INSTANCE_ID;
  const token = process.env.WHATSAPP_TOKEN;
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;

  // 1. UltraMsg Gateway Direct Sending
  if (instanceId && token) {
    try {
      const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token: token,
          to: `+${cleanPhone}`,
          body: text,
        }),
      });

      const result = await response.json();
      console.log(`[WhatsApp UltraMsg] Dispatched to +${cleanPhone}:`, result);
      return { success: true, method: 'ultramsg', result, text, cleanPhone };
    } catch (err) {
      console.error('[WhatsApp UltraMsg Error]:', err.message);
      return { success: false, error: err.message, text, cleanPhone };
    }
  }

  // 2. Custom Webhook / Local Gateway Direct Sending
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: cleanPhone,
          message: text,
          billNumber: bill.billNumber,
          customerName: bill.customerName,
          grandTotal: bill.grandTotal,
        }),
      });
      const result = await response.json();
      console.log(`[WhatsApp Webhook] Dispatched to ${cleanPhone}:`, result);
      return { success: true, method: 'webhook', result, text, cleanPhone };
    } catch (err) {
      console.error('[WhatsApp Webhook Error]:', err.message);
      return { success: false, error: err.message, text, cleanPhone };
    }
  }

  // Gateway credentials not yet provided in .env
  console.log(`[WhatsApp Service] Message prepared for +${cleanPhone}. Configure WHATSAPP_INSTANCE_ID & WHATSAPP_TOKEN in .env for direct automated background dispatch.`);
  return {
    success: false,
    gatewayNotConfigured: true,
    reason: 'WhatsApp API credentials not configured in backend/.env',
    text,
    cleanPhone,
  };
};

module.exports = { sendWhatsAppInvoice };
