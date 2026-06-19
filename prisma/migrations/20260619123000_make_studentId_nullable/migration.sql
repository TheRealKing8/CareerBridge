-- Make Application.studentId nullable so EMPLOYEE applicants can submit
-- an application without forcing a studentId value. The original init
-- migration declared it NOT NULL because EMPLOYEE didn't exist yet.
--
-- Exactly one of {studentId, employeeProfileId} should be non-null; the
-- application layer (services/applications.ts apply()) enforces that.
ALTER TABLE `application` MODIFY `studentId` VARCHAR(191) NULL;
