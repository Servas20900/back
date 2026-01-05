import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(' Seed ejecutado');
  console.log(' No hay datos iniciales configurados');
  console.log(' Usa el panel de administración para agregar categorías y productos');
}

main()
  .catch((e) => {
    console.error(' Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

