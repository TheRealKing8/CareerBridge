-- add_employee_role: introduces the EMPLOYEE role and lets experienced
-- job-seekers apply to jobs.
--
--   * EmployeeProfile model (work history, skills, links).
--   * Application.employeeProfileId column — nullable, alongside the
--     existing nullable Application.studentId.
--   * Two unique constraints on Application (one per applicant kind)
--     so a STUDENT can't apply twice and an EMPLOYEE can't either,
--     while still letting the polymorphic FK pattern work cleanly.
--   * Indexes on (employeeProfileId, status) for employee-side queries.
--
-- Notes:
--   * Application.studentId is already nullable; the diff emits a no-op
--     MODIFY, which we drop.
--   * Prisma's diff also wants to DROP+CREATE three indexes that the
--     live DB already has and that the FKs on Notification/Job/SavedJob
--     depend on. We DROP those DROP statements (the matching CREATE
--     statements at the bottom use IF NOT EXISTS so they're a no-op
--     when the index is already there).

-- AlterTable
ALTER TABLE `application` ADD COLUMN `employeeProfileId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `EmployeeProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `currentJobTitle` VARCHAR(191) NULL,
    `currentCompany` VARCHAR(191) NULL,
    `yearsOfExperience` INTEGER NULL,
    `skills` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `cvUrl` VARCHAR(191) NULL,
    `linkedinUrl` VARCHAR(191) NULL,
    `githubUrl` VARCHAR(191) NULL,
    `portfolioUrl` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmployeeProfile_userId_key`(`userId`),
    INDEX `EmployeeProfile_yearsOfExperience_idx`(`yearsOfExperience`),
    INDEX `EmployeeProfile_location_idx`(`location`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- New indexes for the polymorphic applicant column.
CREATE INDEX `Application_employeeProfileId_status_idx` ON `Application`(`employeeProfileId`, `status`);
CREATE UNIQUE INDEX `Application_jobId_employeeProfileId_key` ON `Application`(`jobId`, `employeeProfileId`);

-- Pre-existing composite indexes the diff wants to keep current.
-- IF NOT EXISTS makes these a no-op on databases that already have them
-- (XAMPP dev), and creates them on fresh databases.
CREATE INDEX IF NOT EXISTS `Job_status_publishedAt_idx` ON `Job`(`status`, `publishedAt` DESC);
CREATE INDEX IF NOT EXISTS `Notification_userId_readAt_createdAt_idx` ON `Notification`(`userId`, `readAt`, `createdAt` DESC);
CREATE INDEX IF NOT EXISTS `SavedJob_studentId_savedAt_idx` ON `SavedJob`(`studentId`, `savedAt` DESC);

-- Foreign keys (cascade so deleting a User cleans up the profile rows
-- and any applications they made).
ALTER TABLE `EmployeeProfile` ADD CONSTRAINT `EmployeeProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Application` ADD CONSTRAINT `Application_employeeProfileId_fkey` FOREIGN KEY (`employeeProfileId`) REFERENCES `EmployeeProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
