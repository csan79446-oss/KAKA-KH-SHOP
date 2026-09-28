"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CartProvider, useCart } from "@/context/CartContext";
import { PaymentModal } from "@/components/PaymentModal";
import { Order } from "@/types";
import { formatUSD, formatKHR, formatDate } from "@/lib/khqr";
import {
  ArrowLeft,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  QrCode,
  Search,
  RefreshCw,
  Phone,
  MapPin,
  ChevronRight,
  PackageCheck,
  AlertCircle,
} from "lucide-react";

function OrdersView() {
  const { telegramUser } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [activePaymentOrder, setActivePaymentOrder] = useState<Order | null>(null);

  const fetchUserOrders = async (phoneQuery?: string) => {
    try {
      setLoading(true);
      let url = "/api/orders?";
      
      if (phoneQuery && phoneQuery.trim()) {
        url += `phone=${encodeURIComponent(phoneQuery.trim())}&`;
      } else if (telegramUser?.id) {
        url += `telegramUserId=${telegramUser.id}&`;
      }

      if (filterStatus !== "ALL") {
        url += `status=${filterStatus}&`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Failed to fetch user orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [telegramUser, filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUserOrders(searchPhone);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Paid
          </span>
        );
      case "PREPARING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <PackageCheck className="w-3 h-3 text-blue-600" />
            Preparing
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Truck className="w-3 h-3 text-purple-600" />
            Delivered
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Awaiting Payment
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 shadow-xs">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Back to shop"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base tracking-tight">Order History</h1>
              <p className="text-[11px] text-slate-400">
                {telegramUser ? `Orders for ${telegramUser.first_name || telegramUser.username}` : "Track your deliveries"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchUserOrders(searchPhone)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto w-full px-4 pt-4 flex-1 space-y-4">
        {/* Lookup by Phone if not automatically matching */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Search by phone number or name..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
          >
            Search
          </button>
        </form>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "PENDING", label: "Pending" },
            { id: "PAID", label: "Paid" },
            { id: "PREPARING", label: "Preparing" },
            { id: "DELIVERED", label: "Delivered" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs animate-pulse space-y-3">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              You haven't placed any orders yet, or try searching by your phone number above.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs hover:shadow-md transition-shadow space-y-3"
              >
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">#{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-emerald-600 text-sm">{formatUSD(order.totalAmount)}</div>
                    <div className="text-[10px] text-slate-400">{formatKHR(order.totalAmount)}</div>
                  </div>
                </div>

                {/* Items preview */}
                <div className="bg-slate-50/80 rounded-2xl p-2.5 space-y-1.5 text-xs">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-slate-700">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold truncate">{item.title}</span>
                        <span className="text-[11px] text-slate-400 font-bold">x{item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900 ml-2">{formatUSD(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery details */}
                <div className="pt-1 flex flex-col gap-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{order.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{order.customerPhone} ({order.customerName})</span>
                    </div>
                    <span className="font-semibold text-slate-400">Payment: {order.paymentMethod}</span>
                  </div>
                </div>

                {/* Unpaid Action CTA */}
                {order.status === "PENDING" && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Payment not verified yet
                    </span>
                    <button
                      type="button"
                      onClick={() => setActivePaymentOrder(order)}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Pay with KHQR
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* KHQR Payment Modal for unpaid orders */}
      {activePaymentOrder && (
        <PaymentModal
          order={activePaymentOrder}
          onSuccess={() => {
            setActivePaymentOrder(null);
            fetchUserOrders();
          }}
          onClose={() => setActivePaymentOrder(null)}
        />
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <CartProvider>
      <OrdersView />
    </CartProvider>
  );
}
