export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatKHR(amountUSD: number, rate = 4100): string {
  const khr = Math.round(amountUSD * rate);
  return new Intl.NumberFormat("km-KH").format(khr) + " ៛";
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Generate simulated KHQR payload string following Bakong standard format
 * Format: 000201010212... (EMVCo QR standard for Bakong)
 */
export function generateBakongKHQRString({
  merchantName = "KAKA KH SHOP",
  merchantCity = "Phnom Penh",
  amount,
  transactionId,
}: {
  merchantName?: string;
  merchantCity?: string;
  amount: number;
  transactionId: string;
}): string {
  const formattedAmount = amount.toFixed(2);
  return `00020101021229380010bakong.kh0116merchant@kakakhshop0208KHQRBAKG520459995303840540${formattedAmount.length}${formattedAmount}5802KH59${merchantName.length < 10 ? "0" + merchantName.length : merchantName.length}${merchantName}60${merchantCity.length < 10 ? "0" + merchantCity.length : merchantCity.length}${merchantCity}62${transactionId.length < 10 ? "0" + transactionId.length : transactionId.length}${transactionId}6304ABCD`;
}
