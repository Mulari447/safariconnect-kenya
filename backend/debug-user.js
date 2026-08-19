// backend/debug-user.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "mdlazaro46@gmail.com" },
    include: { roles: true }
  });
  console.log("USER RECORD FOUND:", JSON.stringify(user, null, 2));
}

main().finally(() => prisma.$disconnect());