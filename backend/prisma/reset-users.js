// backend/prisma/reset-users.js
// Deletes all user accounts and everything tied to them, in the correct
// dependency order. Leaves destinations and subscription plans untouched.
// Run with: node prisma/reset-users.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Deleting user-related data...');

  await prisma.leadRequest.deleteMany({});
  await prisma.reviewVote.deleteMany({});
  await prisma.reviewReport.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.tripRequest.deleteMany({});
  await prisma.paymentEvent.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.paymentReminder.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.operatorSubscription.deleteMany({});
  await prisma.operatorCompany.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.profile.deleteMany({});
  const { count } = await prisma.user.deleteMany({});

  console.log(`Deleted ${count} user(s) and all related data.`);
  console.log('Destinations and subscription plans were left untouched.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });