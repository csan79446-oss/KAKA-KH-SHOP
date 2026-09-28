"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, CartItem, TelegramUserData } from "@/types";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalAmount: number;
  telegramUser: TelegramUserData | null;
  isTelegramReady: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [telegramUser, setTelegramUser] = useState<TelegramUserData | null>(null);
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  // Initialize Telegram Web App
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        setIsTelegramReady(true);

        const initData = tg.initData;
        const initDataUnsafe = tg.initDataUnsafe;

        if (initData) {
          // Verify cryptographic signature via backend
          fetch("/api/telegram/validate-init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.valid && data.user) {
                setTelegramUser(data.user);
              } else if (initDataUnsafe?.user) {
                setTelegramUser(initDataUnsafe.user);
              }
            })
            .catch(() => {
              if (initDataUnsafe?.user) {
                setTelegramUser(initDataUnsafe.user);
              }
            });
        } else if (initDataUnsafe?.user) {
          setTelegramUser(initDataUnsafe.user);
        } else {
          // Dev fallback simulation for browser testing
          setTelegramUser({
            id: 88921102,
            first_name: "Sophea",
            last_name: "Meng",
            username: "sophea_m",
            language_code: "km",
          });
        }
      } else {
        // Fallback for regular web browsers
        setTelegramUser({
          id: 88921102,
          first_name: "Sophea",
          last_name: "Meng",
          username: "sophea_m",
          language_code: "km",
        });
      }
    }
  }, []);

  // Restore cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("foodfruit_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("foodfruit_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock !== undefined && product.stock <= 0) {
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const availableStock = product.stock ?? 999;
        const newQty = Math.min(existing.quantity + quantity, availableStock);
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQty }
            : item
        );
      }
      const initialQty = Math.min(quantity, product.stock ?? 999);
      return [...prev, { product, quantity: initialQty }];
    });

    // Provide haptic feedback if inside Telegram WebApp
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred("medium");
      }
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stock ?? 999;
          const cappedQty = Math.min(quantity, maxStock);
          return { ...item, quantity: cappedQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        totalAmount,
        telegramUser,
        isTelegramReady,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
