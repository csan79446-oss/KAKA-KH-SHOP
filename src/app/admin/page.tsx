"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Product, Category, Order, StatsOverview } from "@/types";
import { formatUSD, formatKHR, formatDate } from "@/lib/khqr";
import { ProductModal } from "./components/ProductModal";
import { OrderModal } from "./components/OrderModal";
import { CategoryModal } from "./components/CategoryModal";
import {
  DollarSign,
  ShoppingCart,
  Clock,
  Users,
  Plus,
  Store,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Edit,
  Trash2,
  Package,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  LogOut,
  FileDown,
} from "lucide-react";

export default function AdminDashboard() {
  const [isAdminAuth, setIsAdminAuth] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);

  const [stats, setStats] = useState<StatsOverview>({
    totalRevenue: 0,
    paidOrdersCount: 0,
    totalOrdersCount: 0,
    pendingOrdersCount: 0,
    totalUsersCount: 0,
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "categories">("orders");
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null | undefined>(undefined);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("all");

  const exportOrdersCSV = () => {
    if (orders.length === 0) return;
    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Phone",
      "Delivery Address",
      "Items",
      "Total USD",
      "Payment Method",
      "Status",
      "Notes",
    ];
    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.deliveryAddress.replace(/"/g, '""')}"`,
      `"${o.items.map((i) => `${i.title} x${i.quantity}`).join("; ")}"`,
      `"${o.totalAmount.toFixed(2)}"`,
      `"${o.paymentMethod}"`,
      `"${o.status}"`,
      `"${(o.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `KAKAKHSHOP_Orders_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAuth = sessionStorage.getItem("foodfruit_admin_authenticated");
      if (savedAuth === "true") {
        setIsAdminAuth(true);
      }
    }
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default demo PIN: 1234 or from env
    const validPin = process.env.NEXT_PUBLIC_ADMIN_PIN || "1234";
    if (enteredPin === validPin) {
      setIsAdminAuth(true);
      sessionStorage.setItem("foodfruit_admin_authenticated", "true");
      setPinError(null);
      setEnteredPin("");
    } else {
      setPinError("Incorrect PIN. Default demo PIN is 1234");
      setEnteredPin("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("foodfruit_admin_authenticated");
    setIsAdminAuth(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
      let url = "/api/orders?";
      if (orderStatusFilter !== "ALL") url += `status=${orderStatusFilter}&`;
      if (orderSearchQuery.trim()) url += `search=${encodeURIComponent(orderSearchQuery.trim())}&`;
      const res = await fetch(url);
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      let url = "/api/products";
      if (productCategoryFilter !== "all") url += `?category=${productCategoryFilter}`;
      const res = await fetch(url);
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchOrders(), fetchProducts(), fetchCategories()]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdminAuth) {
      loadAllData();
    }
  }, [orderStatusFilter, productCategoryFilter, orderSearchQuery, isAdminAuth]);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) fetchCategories();
    } catch (e) {
      console.error(e);
    }
  };
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-xl border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Admin Manager Access</h2>
            <p className="text-xs text-slate-400 mt-1">Enter PIN to access store management</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3">
            {pinError && (
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold">
                {pinError}
              </div>
            )}
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              autoFocus
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value)}
              placeholder="Enter PIN (e.g. 1234)"
              className="w-full text-center tracking-widest text-lg font-bold py-3 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              Unlock Dashboard
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Demo PIN: <b>1234</b></span>
            <Link href="/" className="text-emerald-600 font-bold hover:underline">
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Admin Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-md">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-slate-900 text-lg tracking-tight">KAKA KH SHOP</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  Manager Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-400">Order management, live sales & inventory</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={loadAllData}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <Link
              href="/"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-4 h-4 text-emerald-600" />
              View Shop
            </Link>

            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              New Product
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
              title="Lock Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 space-y-6 flex-1">
        {/* Analytics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{formatUSD(stats.totalRevenue)}</h3>
              <p className="text-[10px] text-slate-400">{formatKHR(stats.totalRevenue)}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Paid / Total Orders</p>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {stats.paidOrdersCount} / {stats.totalOrdersCount}
              </h3>
              <p className="text-[10px] text-slate-400">KHQR / ABA verified</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Orders</p>
              <h3 className="text-xl font-black text-amber-600 mt-0.5">{stats.pendingOrdersCount}</h3>
              <p className="text-[10px] text-slate-400">Awaiting payment</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Telegram Users</p>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">{stats.totalUsersCount}</h3>
              <p className="text-[10px] text-slate-400">MiniApp customer profiles</p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "orders" ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "products" ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Package className="w-4 h-4" />
            Products ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "categories" ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-4 h-4" />
            Categories ({categories.length})
          </button>
        </div>

        {/* Tab 1: Orders Table */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Recent Orders</h3>
                <p className="text-xs text-slate-400">Order tracking and verification</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search name, phone, #ID..."
                    className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-500">Filter:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={exportOrdersCSV}
                  disabled={orders.length === 0}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  title="Export Orders to CSV"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-500" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-black text-slate-900">#{order.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{order.customerName}</td>
                      <td className="py-3 px-4 text-slate-600">{order.customerPhone}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">{formatUSD(order.totalAmount)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          order.status === "PAID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {order.paymentMethod}: {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{formatDate(order.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px]"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Products Management */}
        {activeTab === "products" && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Store Products</h3>
                <p className="text-xs text-slate-400">Manage produce, meals, prices and stock counts</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Product
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {products.map((p) => (
                <div key={p.id} className="border border-slate-100 rounded-2xl p-3 flex gap-3 bg-slate-50/50">
                  <img src={p.imageUrl} alt={p.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">{p.category?.name}</span>
                      <h4 className="font-bold text-slate-900 text-xs truncate">{p.name}</h4>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">{formatUSD(p.price)}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400">Stock: {p.stock}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(p)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Categories Management */}
        {activeTab === "categories" && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Categories</h3>
                <p className="text-xs text-slate-400">Manage item classification</p>
              </div>

              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4">
              {categories.map((c) => (
                <div key={c.id} className="p-3 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.icon || "📦"}</span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{c.name}</h4>
                      <span className="text-[10px] text-slate-400">{c._count?.products || 0} products</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(c)}
                      className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {editingProduct !== undefined && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(undefined)}
          onSaved={() => {
            setEditingProduct(undefined);
            loadAllData();
          }}
        />
      )}

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={() => {
            setSelectedOrder(null);
            loadAllData();
          }}
        />
      )}

      {editingCategory !== undefined && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(undefined)}
          onSaved={() => {
            setEditingCategory(undefined);
            loadAllData();
          }}
        />
      )}
    </div>
  );
}

