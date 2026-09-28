"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { formatUSD, formatKHR, generateBakongKHQRString } from "@/lib/khqr";
import { CheckCircle2, Copy, ShieldCheck, Loader2, Download, ExternalLink } from "lucide-react";

interface PaymentModalProps {
  order: any;
  onSuccess: () => void;
  onClose: () => void;
}

export function PaymentModal({ order, onSuccess, onClose }: PaymentModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"KHQR" | "ABA">("KHQR");

  useEffect(() => {
    const rawQrText = generateBakongKHQRString({
      amount: order.totalAmount,
      transactionId: order.transactionId || order.id,
      merchantName: "KAKA KH SHOP",
    });

    QRCode.toDataURL(rawQrText, {
      width: 320,
      margin: 2,
      color: { dark: "#D12128", light: "#FFFFFF" },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error(err));
  }, [order]);

  const handleSimulatePayment = async () => {
    setVerifying(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PAID",
          paymentMethod: activeTab === "KHQR" ? "KHQR" : "ABA_PAYWAY",
        }),
      });

      if (res.ok) {
        setPaymentSuccess(true);
        const tg = (window as any).Telegram?.WebApp;
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred("success");
        setTimeout(() => onSuccess(), 1600);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const copyTxn = () => {
    navigator.clipboard.writeText(order.transactionId || order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeUrl;
    a.download = `KHQR-KAKAKHSHOP-${order.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenApp = () => {
    // ABA or Bakong mobile deep link scheme
    if (activeTab === "ABA") {
      window.location.href = "abamobilebank://";
    } else {
      window.location.href = "bakong://";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white text-slate-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-4 text-center">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/20 rounded-full text-[11px] font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            National QR Standard • Bakong KHQR
          </div>
          <h3 className="text-lg font-bold">Scan to Pay KHQR</h3>
          <p className="text-red-100 text-xs">Supports ABA, Acleda, Canadia, Wing, etc.</p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("KHQR")}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 ${
              activeTab === "KHQR" ? "bg-white text-red-600 border-b-2 border-red-600" : "text-slate-500"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600" />
            Bakong KHQR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ABA")}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 ${
              activeTab === "ABA" ? "bg-white text-blue-700 border-b-2 border-blue-700" : "text-slate-500"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-700" />
            ABA PayWay
          </button>
        </div>

        <div className="p-4 flex flex-col items-center">
          {paymentSuccess ? (
            <div className="py-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Payment Verified!</h4>
              <p className="text-xs text-slate-500 mt-1">Order #{order.id} is confirmed.</p>
              <div className="mt-3 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-base">
                {formatUSD(order.totalAmount)}
              </div>
            </div>
          ) : (
            <>
              <div className="w-full bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100 mb-3">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Amount</span>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-black text-slate-900">{formatUSD(order.totalAmount)}</span>
                  <span className="text-xs font-semibold text-slate-500">({formatKHR(order.totalAmount)})</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="relative p-2.5 bg-white rounded-xl border border-dashed border-red-200 shadow-sm flex items-center justify-center">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="KHQR Code" className="w-48 h-48 object-contain" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow pointer-events-none">
                  KHQR
                </div>
              </div>

              {/* Quick Actions for Mobile users */}
              <div className="w-full mt-2.5 grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  Save QR
                </button>
                <button
                  type="button"
                  onClick={handleOpenApp}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  {activeTab === "ABA" ? "Open ABA" : "Open Bakong"}
                </button>
              </div>

              <div className="w-full mt-2 flex items-center justify-between text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg">
                <span className="truncate max-w-[170px]">Txn: {order.transactionId || order.id}</span>
                <button type="button" onClick={copyTxn} className="flex items-center gap-1 font-bold text-red-600">
                  <Copy className="w-3 h-3" />
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center mt-2">
                Save QR to your gallery or scan with any Cambodian banking app.
              </p>

              <div className="w-full mt-3 space-y-2">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={verifying}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Verifying with Bank...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Simulate Paid (Test Mode)
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-1.5 text-center text-xs font-medium text-slate-400 hover:text-slate-600"
                >
                  Close & Pay Later
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

