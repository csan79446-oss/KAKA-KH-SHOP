"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { formatUSD, formatKHR } from "@/lib/khqr";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingCart } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onProceedCheckout }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-sm">Shopping Cart ({cart.length})</h3>
          </div>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-3">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Your cart is empty</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                Explore our fresh Khmer fruits and dishes!
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-2.5 bg-slate-50/80 rounded-2xl border border-slate-100"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {item.product.name}
                  </h4>
                  <div className="text-xs font-extrabold text-emerald-600 mt-0.5">
                    {formatUSD(item.product.price)}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 shadow-sm"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-800 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={item.product.stock !== undefined && item.quantity >= item.product.stock}
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-sm transition-colors ${
                        item.product.stock !== undefined && item.quantity >= item.product.stock
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                      title={
                        item.product.stock !== undefined && item.quantity >= item.product.stock
                          ? "Max stock reached"
                          : "Increase quantity"
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    {item.product.stock !== undefined && item.quantity >= item.product.stock && (
                      <span className="text-[10px] text-amber-600 font-semibold">Max</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-14">
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-slate-700">
                    {formatUSD(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500">Subtotal</span>
              <div className="text-right">
                <span className="text-lg font-black text-slate-900">{formatUSD(totalAmount)}</span>
                <span className="text-xs font-medium text-slate-400 ml-1.5">({formatKHR(totalAmount)})</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedCheckout();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
            >
              Checkout Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
