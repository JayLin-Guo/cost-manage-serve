-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `role` ENUM('ADMIN', 'COST_ENGINEER', 'SUPERVISOR', 'STAFF') NOT NULL DEFAULT 'STAFF',
    `department` VARCHAR(100) NULL,
    `avatar` VARCHAR(500) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviewer_assignments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `reviewerLevel` ENUM('LEVEL_1', 'LEVEL_2', 'LEVEL_3') NOT NULL DEFAULT 'LEVEL_1',
    `department` VARCHAR(100) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `assigned_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reviewer_assignments_reviewerLevel_idx`(`reviewerLevel`),
    INDEX `reviewer_assignments_updated_at_idx`(`updated_at`),
    INDEX `reviewer_assignments_department_idx`(`department`),
    UNIQUE INDEX `reviewer_assignments_user_id_reviewerLevel_department_key`(`user_id`, `reviewerLevel`, `department`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectName` VARCHAR(200) NOT NULL,
    `projectType` VARCHAR(100) NOT NULL,
    `clientUnit` VARCHAR(200) NOT NULL,
    `projectSource` VARCHAR(100) NULL,
    `contractAmount` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `attachments` JSON NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'SUSPENDED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `creator_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `projects_creator_id_idx`(`creator_id`),
    INDEX `projects_projectName_idx`(`projectName`),
    INDEX `projects_projectType_idx`(`projectType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reviewer_assignments` ADD CONSTRAINT `reviewer_assignments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
