-- AddForeignKey
ALTER TABLE `person_phone` ADD CONSTRAINT `person_phone_person_id_fkey` FOREIGN KEY (`person_id`) REFERENCES `person`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
