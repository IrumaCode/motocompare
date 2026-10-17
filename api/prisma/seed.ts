import { createPrismaClient } from '../src/db/prisma-client.js';
import type { Prisma } from '../src/generated/prisma/client.js';
import { brands } from './seed-data/brands.js';
import { categories } from './seed-data/categories.js';
import { motorcycles } from './seed-data/motorcycles.js';

type Tx = Prisma.TransactionClient;
type IdsBySlug = Map<string, number>;

function toSlug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // strip accent marks left by NFD: "Ténéré" -> "Tenere"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function requireId(ids: IdsBySlug, slug: string): number {
  const id = ids.get(slug);
  if (id === undefined) {
    throw new Error(`Unknown slug referenced in seed data: "${slug}"`);
  }
  return id;
}

async function seedBrands(tx: Tx): Promise<IdsBySlug> {
  const ids: IdsBySlug = new Map();
  for (const brand of brands) {
    const { id } = await tx.brand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: brand,
    });
    ids.set(brand.slug, id);
  }
  return ids;
}

async function seedCategories(tx: Tx): Promise<IdsBySlug> {
  const ids: IdsBySlug = new Map();
  for (const category of categories) {
    const { id } = await tx.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    ids.set(category.slug, id);
  }
  return ids;
}

async function seedMotorcycles(tx: Tx, brandIds: IdsBySlug, categoryIds: IdsBySlug): Promise<void> {
  const seededSlugs: string[] = [];
  for (const { brandSlug, categorySlug, ...specs } of motorcycles) {
    const slug = toSlug(`${brandSlug} ${specs.name} ${String(specs.year)}`);
    const data = {
      ...specs,
      slug,
      brandId: requireId(brandIds, brandSlug),
      categoryId: requireId(categoryIds, categorySlug),
    };
    await tx.motorcycle.upsert({ where: { slug }, update: data, create: data });
    seededSlugs.push(slug);
  }

  // The seed is the source of truth: drop motorcycles renamed or removed from the seed data
  await tx.motorcycle.deleteMany({ where: { slug: { notIn: seededSlugs } } });
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set (copy .env.example to .env)');
  }

  const prisma = createPrismaClient(databaseUrl);
  try {
    // One transaction: the seed either applies completely or not at all.
    // Generous limits because a remote database (Neon) may need seconds to wake up.
    await prisma.$transaction(
      async (tx) => {
        const brandIds = await seedBrands(tx);
        const categoryIds = await seedCategories(tx);
        await seedMotorcycles(tx, brandIds, categoryIds);
      },
      { maxWait: 10_000, timeout: 30_000 },
    );
    console.info(
      `Seed done: ${String(brands.length)} brands, ${String(categories.length)} categories, ${String(motorcycles.length)} motorcycles`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

await main();
