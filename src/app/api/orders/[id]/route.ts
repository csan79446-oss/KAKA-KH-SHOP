import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        telegramUser: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, paymentMethod, notes, deliveryAddress, customerPhone } = body;

    const data: any = {};
    if (status) {
      data.status = status;
      if (status === "PAID" || status === "DELIVERED") {
        data.paidAt = new Date();
      }
    }
    if (paymentMethod) data.paymentMethod = paymentMethod;
    if (notes !== undefined) data.notes = notes;
    if (deliveryAddress) data.deliveryAddress = deliveryAddress;
    if (customerPhone) data.customerPhone = customerPhone;

    const updated = await prisma.order.update({
      where: { id },
      data,
      include: {
        items: true,
        telegramUser: true,
      },
    });

    // Notify customer on Telegram if status changed and user has telegramUserId
    if (status && updated.telegramUserId) {
      const statusIcons: Record<string, string> = {
        PAID: "✅",
        PREPARING: "👨‍🍳",
        DELIVERED: "🚚",
        CANCELLED: "❌",
        PENDING: "⏳",
      };
      const icon = statusIcons[status] || "📦";
      const message = `${icon} <b>Order Update: #${updated.id}</b>\n\n` +
        `Your order status is now: <b>${status}</b>\n` +
        (updated.notes ? `<i>Note: ${updated.notes}</i>\n` : "") +
        `Total: $${updated.totalAmount.toFixed(2)}\n\n` +
        `Track or view your orders in the KAKA KH SHOP MiniApp anytime!`;

      import("@/lib/telegram").then(({ sendTelegramNotification }) => {
        sendTelegramNotification({ chatId: updated.telegramUserId!, text: message });
      }).catch(() => {});
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.order.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Order deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
