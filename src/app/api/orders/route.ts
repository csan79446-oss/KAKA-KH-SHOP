import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const telegramUserId = searchParams.get("telegramUserId");
    const phone = searchParams.get("phone");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (telegramUserId) {
      where.telegramUserId = telegramUserId;
    }
    if (phone) {
      where.OR = [
        { customerPhone: { contains: phone } },
        { customerName: { contains: phone } },
      ];
    } else if (search) {
      where.OR = [
        { customerPhone: { contains: search } },
        { customerName: { contains: search } },
        { id: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        telegramUser: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      telegramUser,
      customerName,
      customerPhone,
      deliveryAddress,
      paymentMethod = "KHQR",
      items,
      notes,
    } = body;

    if (!customerName || !customerPhone || !deliveryAddress || !items || !items.length) {
      return NextResponse.json(
        { error: "Name, phone, address, and items are required" },
        { status: 400 }
      );
    }

    // Upsert telegram user if telegram details provided
    let tgUserId: string | null = null;
    if (telegramUser && telegramUser.id) {
      tgUserId = String(telegramUser.id);
      await prisma.telegramUser.upsert({
        where: { id: tgUserId },
        update: {
          username: telegramUser.username || undefined,
          firstName: telegramUser.first_name || undefined,
          lastName: telegramUser.last_name || undefined,
          phone: customerPhone,
        },
        create: {
          id: tgUserId,
          username: telegramUser.username || null,
          firstName: telegramUser.first_name || null,
          lastName: telegramUser.last_name || null,
          phone: customerPhone,
        },
      });
    }

    // 1. Stock validation pre-check
    for (const item of items) {
      const pid = item.productId || item.id;
      const requestedQty = parseInt(item.quantity);
      if (pid) {
        const prod = await prisma.product.findUnique({
          where: { id: pid },
          select: { id: true, name: true, stock: true },
        });
        if (prod && prod.stock < requestedQty) {
          return NextResponse.json(
            {
              error: `Insufficient stock for "${prod.name}". Only ${prod.stock} item(s) left in stock.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // 2. Calculate total amount & prepare items
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const price = parseFloat(item.price);
      const quantity = parseInt(item.quantity);
      totalAmount += price * quantity;

      orderItemsData.push({
        productId: item.productId || item.id || null,
        title: item.name || item.title || "Item",
        price,
        quantity,
      });

      // Decrement product stock if product exists
      const pid = item.productId || item.id;
      if (pid) {
        try {
          await prisma.product.update({
            where: { id: pid },
            data: {
              stock: {
                decrement: quantity,
              },
            },
          });
        } catch (e) {
          console.warn("Could not decrement stock for", pid, e);
        }
      }
    }

    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const txnId = "TXN-" + paymentMethod + "-" + Date.now().toString().slice(-8);

    const order = await prisma.order.create({
      data: {
        id: orderId,
        telegramUserId: tgUserId,
        customerName,
        customerPhone,
        deliveryAddress,
        totalAmount: Math.round(totalAmount * 100) / 100,
        status: "PENDING",
        paymentMethod,
        transactionId: txnId,
        notes: notes || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
        telegramUser: true,
      },
    });

    // 3. Send Telegram confirmation message if applicable
    if (tgUserId) {
      const message = `🛍️ <b>KAKA KH SHOP — Order Placed!</b>\n\n` +
        `Order ID: <code>#${order.id}</code>\n` +
        `Total: <b>$${order.totalAmount.toFixed(2)}</b> (${new Intl.NumberFormat("km-KH").format(Math.round(order.totalAmount * 4100))} ៛)\n` +
        `Payment: <b>${order.paymentMethod}</b> (Status: <i>${order.status}</i>)\n` +
        `Deliver to: ${order.deliveryAddress}\n\n` +
        `🙏 Thank you for ordering fresh Cambodian produce!`;

      // Non-blocking notification
      import("@/lib/telegram").then(({ sendTelegramNotification }) => {
        sendTelegramNotification({ chatId: tgUserId!, text: message });
      }).catch(() => {});
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
