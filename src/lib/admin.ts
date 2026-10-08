import "server-only";
import { and, asc, count, desc, eq, gte, inArray, lt, lte, sql, sum } from "drizzle-orm";
import { db } from "@/db";
import { categories, orders, products, variants, type OrderStatus } from "@/db/schema";

export const LOW_STOCK_THRESHOLD = 3;
const REVENUE_STATUSES: OrderStatus[] = ["paid", "shipped", "delivered"];

export async function getDashboard() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const abandonedBefore = new Date(Date.now() - 35 * 60 * 1000);

  const [[revenue], [toShip], [abandoned], lowStock, latest] = await Promise.all([
    db
      .select({ total: sum(orders.totalCents).mapWith(Number), count: count() })
      .from(orders)
      .where(and(inArray(orders.status, REVENUE_STATUSES), gte(orders.paidAt, since))),
    db.select({ count: count() }).from(orders).where(eq(orders.status, "paid")),
    db
      .select({ count: count() })
      .from(orders)
      .where(and(eq(orders.status, "pending_payment"), lt(orders.createdAt, abandonedBefore))),
    db
      .select({
        productId: products.id,
        name: products.name,
        label: variants.label,
        stock: variants.stock,
      })
      .from(variants)
      .innerJoin(products, eq(products.id, variants.productId))
      .where(and(lte(variants.stock, LOW_STOCK_THRESHOLD), eq(products.isPublished, true)))
      .orderBy(asc(variants.stock), asc(products.name)),
    db.query.orders.findMany({ orderBy: desc(orders.createdAt), limit: 6 }),
  ]);

  return {
    revenueCents: revenue.total ?? 0,
    paidOrders: revenue.count,
    averageBasketCents: revenue.count ? Math.round((revenue.total ?? 0) / revenue.count) : 0,
    toShip: toShip.count,
    abandoned: abandoned.count,
    lowStock,
    latest,
  };
}

export async function getAdminProducts() {
  return db
    .select({
      id: products.id,
      name: products.name,
      brand: products.brand,
      image: products.image,
      isPublished: products.isPublished,
      isFeatured: products.isFeatured,
      category: categories.name,
      variantCount: count(variants.id),
      stock: sql<number>`coalesce(sum(${variants.stock}), 0)::int`,
      minPrice: sql<number | null>`min(${variants.priceCents})`,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(variants, eq(variants.productId, products.id))
    .groupBy(products.id, categories.name, categories.position)
    .orderBy(asc(categories.position), asc(products.name));
}

export async function getAdminProduct(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: { variants: { orderBy: (v) => asc(v.position) } },
  });
}

export async function getAllCategories() {
  return db.query.categories.findMany({ orderBy: asc(categories.position) });
}

export async function getAdminOrders(status?: OrderStatus) {
  return db.query.orders.findMany({
    where: status ? eq(orders.status, status) : undefined,
    orderBy: desc(orders.createdAt),
    limit: 100,
    with: { items: { columns: { quantity: true } } },
  });
}

export async function getAdminOrder(reference: string) {
  return db.query.orders.findFirst({
    where: eq(orders.reference, reference),
    with: { items: true, user: { columns: { name: true, email: true } } },
  });
}
