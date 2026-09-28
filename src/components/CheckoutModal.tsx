"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatUSD, formatKHR } from "@/lib/khqr";
import { X, MapPin, Phone, User, ShoppingBag, ShieldCheck, Loader2 } from "lucide-react";

interface CheckoutModalProps {
  onClose: () => void;
  onOrderCreated: (order: any) => void;
}

export function CheckoutModal({ onClose, onOrderCreated }: CheckoutModalProps) {
  const { cart, totalAmount, clearCart, telegramUser } = useCart();

  const [customerName, setCustomerName] = useState(
    telegramUser
      ? [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ")
      : "Sokha Chan"
  );
  const [customerPhone, setCustomerPhone] = useState("012 345 678");
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Building #12, St 310, BKK1, Phnom Penh"
  );
  const [paymentMethod, setPaymentMethod] = useState<"KHQR" | "ABA_PAYWAY" | "CASH_ON_DELIVERY">("KHQR");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setError("Please fill in all delivery details");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        telegramUser,
        customerName,
        customerPhone,
        deliveryAddress,
        paymentMethod,
        notes,
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to place order");

      const orderData = await res.json();
      clearCart();
      onOrderCreated(orderData);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white text-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Checkout Order</h3>
              <p className="text-[11px] text-slate-500">KAKA KH SHOP • Fast Delivery</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                Customer Full Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Delivery Address in Phnom Penh
              </label>
              <textarea
                required
                rows={2}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("KHQR")}
                className={`p-2 rounded-xl border text-left flex items-start gap-2 ${
                  paymentMethod === "KHQR" ? "border-red-500 bg-red-50 ring-2 ring-red-500/20" : "border-slate-200"
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full mt-1 bg-red-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Bakong KHQR</div>
                  <div className="text-[10px] text-slate-500">Scan & Pay</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("ABA_PAYWAY")}
                className={`p-2 rounded-xl border text-left flex items-start gap-2 ${
                  paymentMethod === "ABA_PAYWAY" ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/20" : "border-slate-200"
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full mt-1 bg-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">ABA PayWay</div>
                  <div className="text-[10px] text-slate-500">ABA Mobile</div>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 bg-slate-50 -mx-4 -mb-4 p-4">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-sm font-bold text-slate-900">Total Payable</span>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-600">{formatUSD(totalAmount)}</div>
                <div className="text-[11px] text-slate-500">({formatKHR(totalAmount)})</div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-75 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 transition-transform"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Proceed to Pay ({formatUSD(totalAmount)})
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

