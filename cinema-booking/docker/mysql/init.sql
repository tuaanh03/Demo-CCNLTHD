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
    `phone` VARCHAR(50)
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

CREATE TABLE IF NOT EXISTS `user_roles` (
    `user_id` VARCHAR(36) NOT NULL,
    `roles_name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`user_id`, `roles_name`),
    CONSTRAINT `fk_user_roles_user`
        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_user_roles_role`
        FOREIGN KEY (`roles_name`) REFERENCES `role`(`name`) ON DELETE CASCADE
);
