import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gazel.com' },
    update: {},
    create: {
      email: 'admin@gazel.com',
      full_name: 'Administrador GAZEL',
      password_hash: adminPassword,
      phone: '8888-8888',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('Usuario administrador creado:');
  console.log('   Email: admin@gazel.com');
  console.log('   Password: admin123');
  console.log('\nUsa el panel de administración para agregar categorías y productos');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

