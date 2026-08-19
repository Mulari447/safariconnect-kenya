require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = "mdlazaro46@gmail.com"; 
  const plainPassword = "SecurePassword123"; 

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { 
        passwordHash: hashedPassword,
        emailVerified: true
      }
    });
    console.log(`Updated existing user ${email}!`);
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        emailVerified: true,
        roles: {
          create: [{ role: 'admin' }]
        }
      }
    });
    console.log(`Created admin user: ${email} with password: ${plainPassword}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });