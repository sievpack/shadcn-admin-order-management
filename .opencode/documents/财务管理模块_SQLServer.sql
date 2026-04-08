-- ============================================
-- 财务管理模块数据库表 (SQL Server)
-- ============================================

-- 1. 应收账款表
CREATE TABLE [应收账款表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [应收单号] NVARCHAR(50) NOT NULL UNIQUE,  -- AR-YYYYMMDD-001
    [关联订单] NVARCHAR(50),
    [客户名称] NVARCHAR(100) NOT NULL,
    [应收金额] DECIMAL(18,2) NOT NULL,
    [已收金额] DECIMAL(18,2) DEFAULT 0,
    [应收余额] DECIMAL(18,2) NOT NULL,
    [应收日期] DATE NOT NULL,
    [到期日期] DATE,
    [账期类型] NVARCHAR(20) DEFAULT N'月结30天',  -- 预付款/月结30天/货到付款
    [收款状态] NVARCHAR(20) DEFAULT N'未收款',  -- 未收款/部分收款/已结清/坏账
    [备注] NVARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    [update_at] DATETIME DEFAULT GETDATE(),
    [create_by] NVARCHAR(50)
);

CREATE INDEX [idx_应收单号] ON [应收账款表]([应收单号]);
CREATE INDEX [idx_收款状态] ON [应收账款表]([收款状态]);
CREATE INDEX [idx_客户名称] ON [应收账款表]([客户名称]);
CREATE INDEX [idx_应收日期] ON [应收账款表]([应收日期]);

-- 2. 收款记录表
CREATE TABLE [收款记录表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [收款单号] NVARCHAR(50) NOT NULL UNIQUE,  -- CR-YYYYMMDD-001
    [关联应收] NVARCHAR(50),
    [收款金额] DECIMAL(18,2) NOT NULL,
    [收款方式] NVARCHAR(20) NOT NULL,  -- 现金/银行转账/承兑/微信/支付宝
    [收款日期] DATE NOT NULL,
    [核销状态] NVARCHAR(20) DEFAULT N'未核销',  -- 未核销/已核销/部分核销
    [操作人] NVARCHAR(50),
    [备注] NVARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    [create_by] NVARCHAR(50),
    FOREIGN KEY ([关联应收]) REFERENCES [应收账款表]([应收单号])
);

CREATE INDEX [idx_收款单号] ON [收款记录表]([收款单号]);
CREATE INDEX [idx_关联应收] ON [收款记录表]([关联应收]);
CREATE INDEX [idx_核销状态] ON [收款记录表]([核销状态]);
CREATE INDEX [idx_收款日期] ON [收款记录表]([收款日期]);

-- 3. 应收账款核销表
CREATE TABLE [应收账款核销表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [核销编号] NVARCHAR(50) NOT NULL UNIQUE,  -- HX-YYYYMMDD-001
    [应收单号] NVARCHAR(50) NOT NULL,
    [收款单号] NVARCHAR(50) NOT NULL,
    [核销金额] DECIMAL(18,2) NOT NULL,
    [核销日期] DATE NOT NULL,
    [核销人] NVARCHAR(50),
    [备注] NVARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([应收单号]) REFERENCES [应收账款表]([应收单号]),
    FOREIGN KEY ([收款单号]) REFERENCES [收款记录表]([收款单号])
);

CREATE INDEX [idx_核销编号] ON [应收账款核销表]([核销编号]);
CREATE INDEX [idx_应收单号_核销] ON [应收账款核销表]([应收单号]);
CREATE INDEX [idx_收款单号_核销] ON [应收账款核销表]([收款单号]);

-- 4. 应付账款表
CREATE TABLE [应付账款表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [应付单号] NVARCHAR(50) NOT NULL UNIQUE,  -- AP-YYYYMMDD-001
    [关联订单] NVARCHAR(50),
    [供应商名称] NVARCHAR(100) NOT NULL,
    [应付金额] DECIMAL(18,2) NOT NULL,
    [已付金额] DECIMAL(18,2) DEFAULT 0,
    [应付余额] DECIMAL(18,2) NOT NULL,
    [应付日期] DATE NOT NULL,
    [到期日期] DATE,
    [账期类型] NVARCHAR(20) DEFAULT N'月结30天',
    [付款状态] NVARCHAR(20) DEFAULT N'未付款',  -- 未付款/部分付款/已结清
    [备注] NVARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    [update_at] DATETIME DEFAULT GETDATE(),
    [create_by] NVARCHAR(50)
);

CREATE INDEX [idx_应付单号] ON [应付账款表]([应付单号]);
CREATE INDEX [idx_付款状态] ON [应付账款表]([付款状态]);
CREATE INDEX [idx_供应商名称] ON [应付账款表]([供应商名称]);

-- 5. 付款记录表
CREATE TABLE [付款记录表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [付款单号] NVARCHAR(50) NOT NULL UNIQUE,  -- PY-YYYYMMDD-001
    [关联应付] NVARCHAR(50),
    [付款金额] DECIMAL(18,2) NOT NULL,
    [付款方式] NVARCHAR(20) NOT NULL,  -- 现金/银行转账/承兑
    [付款日期] DATE NOT NULL,
    [核销状态] NVARCHAR(20) DEFAULT N'未核销',
    [操作人] NVARCHAR(50),
    [备注] NVARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    [create_by] NVARCHAR(50),
    FOREIGN KEY ([关联应付]) REFERENCES [应付账款表]([应付单号])
);

CREATE INDEX [idx_付款单号] ON [付款记录表]([付款单号]);
CREATE INDEX [idx_关联应付] ON [付款记录表]([关联应付]);

-- 6. 付款核销表
CREATE TABLE [付款核销表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [核销编号] NVARCHAR(50) NOT NULL UNIQUE,
    [应付单号] NVARCHAR(50) NOT NULL,
    [付款单号] NVARCHAR(50) NOT NULL,
    [核销金额] DECIMAL(18,2) NOT NULL,
    [核销日期] DATE NOT NULL,
    [核销人] NVARCHAR(50),
    [备注] NVARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([应付单号]) REFERENCES [应付账款表]([应付单号]),
    FOREIGN KEY ([付款单号]) REFERENCES [付款记录表]([付款单号])
);

-- 7. 凭证表
CREATE TABLE [凭证表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [凭证编号] NVARCHAR(50) NOT NULL UNIQUE,  -- VCH-YYYYMMDD-001
    [凭证日期] DATE NOT NULL,
    [凭证类型] NVARCHAR(20) DEFAULT N'记账凭证',  -- 记账凭证/收款凭证/付款凭证/转账凭证
    [摘要] NVARCHAR(255) NOT NULL,
    [科目] NVARCHAR(100) NOT NULL,
    [借方金额] DECIMAL(18,2) DEFAULT 0,
    [贷方金额] DECIMAL(18,2) DEFAULT 0,
    [审核状态] NVARCHAR(20) DEFAULT N'待审核',  -- 待审核/已审核/已过账
    [审核人] NVARCHAR(50),
    [附件数量] INT DEFAULT 0,
    [备注] NVARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    [update_at] DATETIME DEFAULT GETDATE(),
    [create_by] NVARCHAR(50)
);

CREATE INDEX [idx_凭证编号] ON [凭证表]([凭证编号]);
CREATE INDEX [idx_审核状态] ON [凭证表]([审核状态]);
CREATE INDEX [idx_凭证日期] ON [凭证表]([凭证日期]);
CREATE INDEX [idx_科目] ON [凭证表]([科目]);

GO

-- ============================================
-- 视图
-- ============================================

GO

-- 8. 收入统计视图
CREATE VIEW [收入统计视图] AS
SELECT 
    YEAR([应收日期]) AS 年份,
    MONTH([应收日期]) AS 月份,
    [客户名称],
    SUM([应收金额]) AS 应收金额,
    SUM([已收金额]) AS 已收金额,
    SUM([应收余额]) AS 应收余额
FROM [应收账款表]
GROUP BY YEAR([应收日期]), MONTH([应收日期]), [客户名称];

GO

-- 9. 应收账款账龄视图
CREATE VIEW [应收账款账龄视图] AS
SELECT 
    [应收单号],
    [客户名称],
    [应收金额],
    [已收金额],
    [应收余额],
    [应收日期],
    [到期日期],
    DATEDIFF(DAY, [应收日期], GETDATE()) AS 账龄天数,
    CASE 
        WHEN DATEDIFF(DAY, [应收日期], GETDATE()) <= 30 THEN N'30天内'
        WHEN DATEDIFF(DAY, [应收日期], GETDATE()) <= 60 THEN N'31-60天'
        WHEN DATEDIFF(DAY, [应收日期], GETDATE()) <= 90 THEN N'61-90天'
        ELSE N'90天以上'
    END AS 账龄区间
FROM [应收账款表]
WHERE [收款状态] IN (N'未收款', N'部分收款');

GO

-- 10. 应付账款账龄视图
CREATE VIEW [应付账款账龄视图] AS
SELECT 
    [应付单号],
    [供应商名称],
    [应付金额],
    [已付金额],
    [应付余额],
    [应付日期],
    [到期日期],
    DATEDIFF(DAY, [应付日期], GETDATE()) AS 账龄天数,
    CASE 
        WHEN DATEDIFF(DAY, [应付日期], GETDATE()) <= 30 THEN N'30天内'
        WHEN DATEDIFF(DAY, [应付日期], GETDATE()) <= 60 THEN N'31-60天'
        WHEN DATEDIFF(DAY, [应付日期], GETDATE()) <= 60 THEN N'61-90天'
        ELSE N'90天以上'
    END AS 账龄区间
FROM [应付账款表]
WHERE [付款状态] IN (N'未付款', N'部分付款');