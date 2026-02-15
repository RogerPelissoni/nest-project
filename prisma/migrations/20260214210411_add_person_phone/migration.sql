-- CreateTable
CREATE TABLE `person_phone` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `person_id` BIGINT NOT NULL,
    `ds_phone` VARCHAR(50) NOT NULL,
    `company_id` BIGINT NOT NULL,
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `person_phone` ADD CONSTRAINT `person_phone_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `person_phone` ADD CONSTRAINT `person_phone_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `person_phone` ADD CONSTRAINT `person_phone_updated_by_fkey` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
