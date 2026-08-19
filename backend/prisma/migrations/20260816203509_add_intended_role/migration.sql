/*
  Warnings:

  - You are about to drop the column `reset_expires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `reset_token` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reset_password_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `users_reset_token_key` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `reset_expires`,
    DROP COLUMN `reset_token`,
    ADD COLUMN `intended_role` VARCHAR(191) NULL,
    ADD COLUMN `reset_password_expires` DATETIME(3) NULL,
    ADD COLUMN `reset_password_token` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_reset_password_token_key` ON `users`(`reset_password_token`);
