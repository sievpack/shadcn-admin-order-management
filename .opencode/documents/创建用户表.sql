CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    email NVARCHAR(100),
    phone NVARCHAR(20),
    role NVARCHAR(20) NOT NULL DEFAULT 'cashier',
    status NVARCHAR(20) NOT NULL DEFAULT 'active',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
INSERT INTO Users (username, password, first_name, last_name, role, status)
VALUES ('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统', '管理员', 'admin', 'active');