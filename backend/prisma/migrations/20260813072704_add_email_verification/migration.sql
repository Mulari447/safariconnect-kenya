/*
  Warnings:

  - A unique constraint covering the columns `[verification_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `verification_expires` DATETIME(3) NULL,
    ADD COLUMN `verification_token` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_verification_token_key` ON `users`(`verification_token`);
