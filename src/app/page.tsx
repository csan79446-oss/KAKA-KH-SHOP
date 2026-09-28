"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CartProvider, useCart } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutModal } from "@/components/CheckoutModal";
import { PaymentModal } from "@/components/PaymentModal";
import { Product, Category } from "@/types";
import { formatUSD, formatKHR } from "@/lib/khqr";
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Sparkles,
  Plus,
  Check,
  ShieldCheck,
  LayoutDashboard,
  RefreshCw,
  UtensilsCrossed,
  ReceiptText,
} from "lucide-react";

function StoreFront() {
  const { cart, addToCart, cartCount, totalAmount, telegramUser } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [activeOrderForPayment, setActiveOrderForPayment] = useState<any>(null);

  // Added animation state map
  const [addedAnimation, setAddedAnimation] = useState<Record<string, boolean>>({});

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = "/api/products?";
      if (activeCategory && activeCategory !== "all") {
        url += `category=${activeCategory}&`;
      }
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, searchQuery]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedAnimation((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedAnimation((prev) => ({ ...prev, [product.id]: false }));
    }, 1200);
  };
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-emerald-600/20">
              🥗
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-slate-900 text-base tracking-tight">KAKA KH SHOP</h1>
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">MiniApp</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {telegramUser ? `Hello, ${telegramUser.first_name || telegramUser.username}!` : "Cambodia's Fresh Groceries"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/orders"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 text-xs font-semibold transition-colors"
              title="My Orders"
            >
              <ReceiptText className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">My Orders</span>
            </Link>

            <Link
              href="/admin"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1.5 text-xs font-semibold transition-colors"
              title="Admin Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Admin</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-transform"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto w-full px-4 pt-4 flex-1 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fresh fruits, Khmer meals, drinks..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
          />
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeCategory === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            <span>✨</span>
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === cat.slug
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>{cat.icon || "🏷️"}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Catalog Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              Menu & Catalog ({products.length})
            </h2>
            <span className="text-[11px] text-slate-400">Bakong KHQR accepted</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-3 border border-slate-100 animate-pulse space-y-2">
                  <div className="w-full h-32 bg-slate-100 rounded-xl" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
              <p className="text-sm font-semibold text-slate-700">No products found</p>
              <p className="text-xs text-slate-400 mt-1">Try another category or search keyword.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((product) => {
                const isAdded = addedAnimation[product.id];
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group"
                  >
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {product.stock <= 0 ? (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md uppercase tracking-wider">
                            Sold Out
                          </span>
                        </div>
                      ) : product.stock <= 5 ? (
                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                          Only {product.stock} left
                        </span>
                      ) : null}
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                          {product.category?.name || "Cambodian produce"}
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                            {product.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                        <div>
                          <div className="text-xs font-extrabold text-slate-900">
                            {formatUSD(product.price)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {formatKHR(product.price)}
                          </div>
                        </div>

                        {product.stock <= 0 ? (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                            Out of stock
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={cart.find((c) => c.product.id === product.id)?.quantity === product.stock}
                            onClick={() => handleAddToCart(product)}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                              isAdded
                                ? "bg-emerald-700 text-white scale-110"
                                : cart.find((c) => c.product.id === product.id)?.quantity === product.stock
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                            }`}
                            title={
                              cart.find((c) => c.product.id === product.id)?.quantity === product.stock
                                ? "Maximum available stock added"
                                : "Add to cart"
                            }
                          >
                            {isAdded ? (
                              <Check className="w-4 h-4 stroke-[3]" />
                            ) : cart.find((c) => c.product.id === product.id)?.quantity === product.stock ? (
                              <span className="text-[10px] font-bold">Max</span>
                            ) : (
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Sticky Cart Floating Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-30 px-4">
          <div className="max-w-md mx-auto bg-slate-900 text-white rounded-2xl shadow-xl p-3 flex items-center justify-between border border-slate-800 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                {cartCount}
              </div>
              <div>
                <div className="text-xs font-black">{formatUSD(totalAmount)}</div>
                <div className="text-[10px] text-slate-400">{formatKHR(totalAmount)}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow active:scale-95 transition-transform"
            >
              Checkout Delivery
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onOrderCreated={(order) => {
            setIsCheckoutOpen(false);
            setActiveOrderForPayment(order);
          }}
        />
      )}

      {/* KHQR Payment Modal */}
      {activeOrderForPayment && (
        <PaymentModal
          order={activeOrderForPayment}
          onSuccess={() => {
            setActiveOrderForPayment(null);
            fetchProducts();
          }}
          onClose={() => setActiveOrderForPayment(null)}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <CartProvider>
      <StoreFront />
    </CartProvider>
  );
}

