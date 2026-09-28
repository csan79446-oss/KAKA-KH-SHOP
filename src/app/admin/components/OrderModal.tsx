"use client";

import React, { useState } from "react";
import { Order } from "@/types";
import { formatUSD, formatKHR, formatDate } from "@/lib/khqr";
import { X, Loader2, CheckCircle2, Truck, Clock, XCircle, ShoppingBag } from "lucide-react";

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdated: () => void;
}

export function OrderModal({ order, onClose, onUpdated }: OrderModalProps) {
  if (!order) return null;

  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.notes || "");
  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        onUpdated();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-slate-800">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Order #{order.id}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                order.status === "PAID"
                  ? "bg-emerald-100 text-emerald-800"
                  : order.status === "PENDING"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-700"
              }`}>
                {order.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Customer & Address Details */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer</span>
              <p className="font-bold text-slate-800 mt-0.5">{order.customerName}</p>
              <p className="text-slate-500">{order.customerPhone}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment</span>
              <p className="font-bold text-slate-800 mt-0.5">{order.paymentMethod}</p>
              <p className="text-slate-400 truncate">{order.transactionId || "No TXN"}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Address</span>
              <p className="text-slate-700 mt-0.5 font-medium">{order.deliveryAddress}</p>
            </div>
          </div>

          {/* Items Purchased */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              Order Items ({order.items.length})
            </h4>
            <div className="space-y-2 border border-slate-100 rounded-2xl p-2.5">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-none">
                  <div>
                    <span className="font-semibold text-slate-800">{item.title}</span>
                    <span className="text-slate-400 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatUSD(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline font-black text-sm">
                <span>Total</span>
                <span className="text-emerald-600">{formatUSD(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Change Order Status */}
          <div className="space-y-2 pt-2">
            <label className="font-bold text-slate-800 block">Update Order Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(["PENDING", "PAID", "PREPARING", "DELIVERED", "CANCELLED"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-2 px-2 rounded-xl text-center font-bold text-xs border transition-all ${
                    status === s
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-800 block mb-1">Staff / Delivery Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent via Grab Express driver..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 font-semibold text-slate-500 hover:text-slate-700">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={submitting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-75"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Status
          </button>
        </div>
      </div>
    </div>
  );
}

