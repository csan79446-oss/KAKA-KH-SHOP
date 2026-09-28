import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Total revenue from PAID or DELIVERED orders
    const paidOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ["PAID", "DELIVERED", "PREPARING"],
        },
      },
      select: {
        totalAmount: true,
      },
    });

    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 2. Count of paid orders
    const paidOrdersCount = paidOrders.length;

    // 3. Total orders count
    const totalOrdersCount = await prisma.order.count();

    // 4. Pending orders count
    const pendingOrdersCount = await prisma.order.count({
      where: {
        status: "PENDING",
      },
    });

    // 5. Total registered users (telegram users or unique customers)
    const totalUsersCount = await prisma.telegramUser.count();

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      paidOrdersCount,
      totalOrdersCount,
      pendingOrdersCount,
      totalUsersCount,
    });
  } catch (error: any) {
    console.error("Error calculating stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
