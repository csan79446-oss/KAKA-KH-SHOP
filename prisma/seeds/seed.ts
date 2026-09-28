import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Fresh Fruits", slug: "fruits", icon: "🍎" },
  { name: "Khmer Food & Meals", slug: "food", icon: "🍲" },
  { name: "Drinks & Smoothies", slug: "drinks", icon: "🥤" },
  { name: "Organic Snacks", slug: "snacks", icon: "🥗" },
];

const products = [
  {
    name: "Kampot Sweet Durian (Monthong)",
    description: "Authentic Kampot durian, creamy texture, rich sweetness and aroma.",
    price: 9.5,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=600&q=80",
    categorySlug: "fruits",
  },
  {
    name: "Battambang Sweet Oranges (1kg)",
    description: "Juicy sweet green-peel oranges sourced from Battambang groves.",
    price: 3.5,
    stock: 50,
    imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80",
    categorySlug: "fruits",
  },
  {
    name: "Traditional Fish Amok with Rice",
    description: "Fresh river fish steamed in coconut lemongrass kroeung curry.",
    price: 5.5,
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    categorySlug: "food",
  },
  {
    name: "Lok Lak Beef with Pepper Lime Dip",
    description: "Tender beef cubes served with Kampot pepper and lime dip.",
    price: 6.0,
    stock: 25,
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    categorySlug: "food",
  },
  {
    name: "Fresh Sugarcane Juice with Calamansi",
    description: "Cold-pressed sugarcane juice with zesty calamansi citrus.",
    price: 1.5,
    stock: 80,
    imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
    categorySlug: "drinks",
  },
  {
    name: "Sun-Dried Kampot Banana Crisps",
    description: "Crispy all-natural golden banana chips toasted with sea salt.",
    price: 2.0,
    stock: 75,
    imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80",
    categorySlug: "snacks",
  },
];

async function main() {
  console.log("Seeding database for Food Fruit KH...");

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon },
    });
    createdCategories[cat.slug] = record.id;
  }

  for (const prod of products) {
    const categoryId = createdCategories[prod.categorySlug];
    if (!categoryId) continue;

    const existing = await prisma.product.findFirst({
      where: { name: prod.name },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          imageUrl: prod.imageUrl,
          categoryId: categoryId,
        },
      });
    } else {
      await prisma.product.create({
        data: {
          name: prod.name,
          description: prod.description,
          price: prod.price,
          stock: prod.stock,
          imageUrl: prod.imageUrl,
          categoryId: categoryId,
        },
      });
    }
  }

  const existingOrders = await prisma.order.count();
  if (existingOrders === 0) {
    const demoUser = await prisma.telegramUser.upsert({
      where: { id: "987654321" },
      update: {},
      create: {
        id: "987654321",
        username: "sokha_kh",
        firstName: "Sokha",
        lastName: "Chan",
        phone: "+855 12 345 678",
      },
    });

    const durian = await prisma.product.findFirst({ where: { name: { contains: "Durian" } } });
    const oranges = await prisma.product.findFirst({ where: { name: { contains: "Oranges" } } });

    await prisma.order.create({
      data: {
        id: "ORD-882314",
        telegramUserId: demoUser.id,
        customerName: "Sokha Chan",
        customerPhone: "012 345 678",
        deliveryAddress: "#45B, St. 2004, Sen Sok, Phnom Penh",
        totalAmount: 16.5,
        status: "PAID",
        paymentMethod: "KHQR",
        transactionId: "TXN-KHQR-9832104",
        paidAt: new Date(),
        notes: "Please call before arrival.",
        items: {
          create: [
            {
              productId: durian?.id,
              title: durian?.name || "Kampot Durian",
              price: durian?.price || 9.5,
              quantity: 1,
            },
            {
              productId: oranges?.id,
              title: oranges?.name || "Battambang Sweet Oranges",
              price: oranges?.price || 3.5,
              quantity: 2,
            },
          ],
        },
      },
    });

    const amok = await prisma.product.findFirst({ where: { name: { contains: "Amok" } } });
    await prisma.order.create({
      data: {
        id: "ORD-993182",
        telegramUserId: demoUser.id,
        customerName: "Dara Som",
        customerPhone: "098 765 432",
        deliveryAddress: "Diamond Island Building C, Koh Pich, Phnom Penh",
        totalAmount: 11.0,
        status: "PENDING",
        paymentMethod: "KHQR",
        transactionId: "TXN-KHQR-9912093",
        notes: "Deliver around 12:00 PM",
        items: {
          create: [
            {
              productId: amok?.id,
              title: amok?.name || "Traditional Fish Amok",
              price: amok?.price || 5.5,
              quantity: 2,
            },
          ],
        },
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

