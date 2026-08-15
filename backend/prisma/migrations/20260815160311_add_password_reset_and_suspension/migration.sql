/*
  Warnings:

  - A unique constraint covering the columns `[reset_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `reset_expires` DATETIME(3) NULL,
    ADD COLUMN `reset_token` VARCHAR(191) NULL,
    ADD COLUMN `suspended` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `users_reset_token_key` ON `users`(`reset_token`);
