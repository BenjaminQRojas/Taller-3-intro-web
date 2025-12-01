// prisma/seed.ts
// NOTE: Prisma Client is generated to a custom path (see prisma/schema.prisma -> generator.output),
// so we import from the generated client entrypoint instead of '@prisma/client'.
import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { faker } from '@faker-js/faker';

// Prisma 7 requires an adapter or Accelerate URL. We use the pg adapter for a direct Postgres connection.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to your .env before running the seed.');
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Belleza'];
const regions = ['Norte', 'Centro', 'Sur'];

async function main() {
  console.log('Borrando datos antiguos...');
  await prisma.sale.deleteMany();

  console.log('Generando 500 ventas fake...');
  
  const sales = [];
  for (let i = 0; i < 500; i++) {
    sales.push({
      date: faker.date.between({ from: '2024-01-01', to: '2025-12-01' }),
      product: faker.commerce.productName(),
      category: faker.helpers.arrayElement(categories),
      amount: parseFloat(faker.commerce.price({ min: 10000, max: 500000 })),
      quantity: faker.number.int({ min: 1, max: 20 }),
      region: faker.helpers.arrayElement(regions),
      customerAge: faker.number.int({ min: 18, max: 80 }),
    });
  }

  await prisma.sale.createMany({ data: sales });
  console.log('¡500 ventas fake generadas!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });