import React from 'react';
import { Printer, Download, Share2, CheckCircle2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

const ThermalReceipt = ({ bill, onPrintComplete }) => {
  const { settings } = useShop();

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
    if (onPrintComplete) onPrintComplete();
  };

  const formattedDate = new Date(bill.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedTime = new Date(bill.createdAt || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const totalQuantity = bill.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="flex flex-col items-center">
      {/* Action Bar (Hidden during actual print) */}
      <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-700 print:hidden">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          <span>Bill Saved (#{bill.billNumber})</span>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-sm"
        >
          <Printer className="w-4 h-4" />
          Print 80mm Receipt
        </button>
      </div>

      {/* 80mm Thermal Receipt Canvas Container */}
      <div
        id="thermal-receipt-container"
        className="w-[80mm] max-w-full bg-white text-black p-3.5 font-mono text-[11px] leading-tight border border-slate-300 shadow-xl rounded-sm print:border-none print:shadow-none print:m-0 print:p-2"
        style={{ fontFamily: "'Courier New', Courier, monospace", breakInside: "avoid" }}
      >
        {/* Header */}
        <div className="text-center pb-2 border-b border-dashed border-black space-y-0.5">
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="Shop Logo" className="mx-auto mb-2 max-w-[60px]" />
            )}
          <h1 className="text-base font-black tracking-wider uppercase font-sans">
            {settings.shopName || 'THE FASHION HUB'}
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-wider">
            {settings.tagline || "Men's Luxury Wear & Tailoring"}
          </p>
          <p className="text-[9px] px-2 leading-tight">
            {settings.address || 'Kamala Theatre Road, Bhainsa 504103'}
          </p>
          <p className="text-[10px] font-bold">
            Ph: {settings.phone || '6309382716'}
          </p>
          {settings.gstin && (
            <p className="text-[9px]">GSTIN: {settings.gstin}</p>
          )}
        </div>

        {/* Invoice Metadata */}
        <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
          <div className="flex justify-between font-bold">
            <span>INVOICE: #{bill.billNumber}</span>
            <span>{bill.paymentMethod}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Date: {formattedDate}</span>
            <span>Time: {formattedTime}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Customer: {bill.customerName || 'Walk-in'}</span>
            <span>{bill.customerPhone ? `Ph: ${bill.customerPhone}` : ''}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Cashier: {bill.cashierName || 'Staff'}</span>
            <span className="font-bold">{bill.status}</span>
          </div>
        </div>

        {/* Items Table Header */}
        <div className="py-1 border-b border-black text-[9px] font-black grid grid-cols-12 gap-1 uppercase">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-center">Sz</div>
          <div className="col-span-1 text-center">Qty</div>
          <div className="col-span-2 text-right">Rate</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {/* Item Rows */}
        <div className="py-1 border-b border-dashed border-black divide-y divide-dotted divide-gray-300">
          {bill.items?.map((item, idx) => (
            <div key={idx} className="py-1 grid grid-cols-12 gap-1 text-[10px] items-center">
              <div className="col-span-5 font-semibold truncate leading-tight">
                {item.name}
              </div>
              <div className="col-span-2 text-center font-mono text-[9px]">
                {item.size || '-'}
              </div>
              <div className="col-span-1 text-center font-bold">
                {item.quantity}
              </div>
              <div className="col-span-2 text-right font-mono text-[9px]">
                {item.price.toFixed(0)}
              </div>
              <div className="col-span-2 text-right font-mono font-bold">
                {item.total.toFixed(0)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals Summary */}
        <div className="py-1.5 border-b border-black text-[10px] space-y-0.5">
          <div className="flex justify-between">
            <span>Subtotal ({totalQuantity} items):</span>
            <span className="font-mono">₹{bill.subtotal?.toFixed(2)}</span>
          </div>

          {bill.discountAmount > 0 && (
            <div className="flex justify-between text-gray-800">
              <span>
                Discount {bill.discountType === 'percentage' ? `(${bill.discountValue}%)` : ''}:
              </span>
              <span className="font-mono">-₹{bill.discountAmount?.toFixed(2)}</span>
            </div>
          )}

          {bill.gstAmount > 0 && (
            <div className="flex justify-between text-gray-800">
              <span>GST ({bill.gstPercentage}%):</span>
              <span className="font-mono">+₹{bill.gstAmount?.toFixed(2)}</span>
            </div>
          )}

          {bill.roundOff !== 0 && (
            <div className="flex justify-between text-gray-700 text-[9px]">
              <span>Round Off:</span>
              <span className="font-mono">₹{bill.roundOff?.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-xs font-black pt-1 border-t border-dashed border-black">
            <span>GRAND TOTAL:</span>
            <span className="font-mono text-sm">₹{bill.grandTotal?.toFixed(2)}</span>
          </div>

          {bill.paymentMethod === 'Cash' && bill.cashReceived > 0 && (
            <div className="pt-1 text-[9px] text-gray-700 flex justify-between border-t border-dotted border-gray-400">
              <span>Cash Tendered: ₹{bill.cashReceived.toFixed(0)}</span>
              <span>Change: ₹{bill.changeReturned?.toFixed(0) || 0}</span>
            </div>
          )}
        </div>

        {/* Footer Notes & Barcode representation */}
        <div className="pt-2 text-center text-[9px] space-y-1">
          <div className="font-mono font-bold tracking-widest py-0.5 border border-dashed border-black my-1">
            * {bill.billNumber} *
          </div>
          <p className="font-bold uppercase tracking-wider text-[10px]">
            Thank You For Shopping!
          </p>
          <p className="text-[8px] text-gray-700">
            {settings.terms || 'Exchange within 7 days with bill. No refunds.'}
          </p>
          <p className="text-[8px] italic text-gray-600">
            Powered by The Fashion Hub POS
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThermalReceipt;
