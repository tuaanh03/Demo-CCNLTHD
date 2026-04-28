CREATE TABLE IF NOT EXISTS `permission` (
    `name` VARCHAR(255) PRIMARY KEY,
    `description` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `role` (
    `name` VARCHAR(255) PRIMARY KEY,
    `description` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `user` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255),
    `email` VARCHAR(255) UNIQUE,
    `password` VARCHAR(255),
    `phone` VARCHAR(50),
    `role_name` VARCHAR(255) NOT NULL,
    CONSTRAINT `fk_user_role`
        FOREIGN KEY (`role_name`) REFERENCES `role`(`name`)
);

CREATE TABLE IF NOT EXISTS `invalidated_token` (
    `id` VARCHAR(255) PRIMARY KEY,
    `expiry_time` DATETIME
);

CREATE TABLE IF NOT EXISTS `role_permissions` (
    `role_name` VARCHAR(255) NOT NULL,
    `permissions_name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`role_name`, `permissions_name`),
    CONSTRAINT `fk_role_permissions_role`
        FOREIGN KEY (`role_name`) REFERENCES `role`(`name`) ON DELETE CASCADE,
    CONSTRAINT `fk_role_permissions_permission`
        FOREIGN KEY (`permissions_name`) REFERENCES `permission`(`name`) ON DELETE CASCADE
);

