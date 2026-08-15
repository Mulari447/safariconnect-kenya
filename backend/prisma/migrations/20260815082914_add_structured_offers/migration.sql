-- AlterTable
ALTER TABLE `lead_requests` ADD COLUMN `offer_amount_kes` DECIMAL(65, 30) NULL,
    ADD COLUMN `offer_valid_until` DATETIME(3) NULL,
    ADD COLUMN `package_details` TEXT NULL;
