require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = "mdlazaro46@gmail.com";
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: true }
  });

  if (!user) {
    console.log("User not found!");
    return;
  }

  // Delete any existing role relations to avoid duplicates
  await prisma.userRole.deleteMany({
    where: { userId: user.id }
  });

  // Create the explicit admin role relation required by your schema
  await prisma.userRole.create({
    data: {
      userId: user.id,
      role: 'admin'
    }
  });

  console.log(`Successfully attached 'admin' role relation to user: ${email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());