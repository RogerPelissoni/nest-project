-- DropForeignKey
ALTER TABLE `person_phone` DROP FOREIGN KEY `person_phone_person_id_fkey`;

-- DropIndex
DROP INDEX `person_phone_person_id_fkey` ON `person_phone`;

-- AddForeignKey
ALTER TABLE `person_phone` ADD CONSTRAINT `person_phone_person_id_fkey` FOREIGN KEY (`person_id`) REFERENCES `person`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
