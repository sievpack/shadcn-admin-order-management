-- ============================================
-- 生产管理模块数据库表 (SQL Server)
-- ============================================

-- 1. 生产计划表
CREATE TABLE [生产计划表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [计划编号] VARCHAR(50) NOT NULL UNIQUE,  -- PC-YYYYMMDD-001
    [计划名称] VARCHAR(100) NOT NULL,
    [关联订单] VARCHAR(50),  -- 订单编号
    [产品类型] VARCHAR(50) NOT NULL,
    [产品型号] VARCHAR(50) NOT NULL,
    [规格] VARCHAR(50),
    [计划数量] INT NOT NULL,
    [已排数量] INT DEFAULT 0,
    [单位] VARCHAR(10) NOT NULL,
    [计划开始日期] DATE NOT NULL,
    [计划完成日期] DATE NOT NULL,
    [实际开始日期] DATE,
    [实际完成日期] DATE,
    [优先级] VARCHAR(20) DEFAULT N'普通',  -- 紧急/高/普通/低
    [计划状态] VARCHAR(20) DEFAULT N'待审核',  -- 待审核/已审核/已排产/生产中/已完成/已取消
    [负责人] VARCHAR(50),
    [备注] VARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    [update_at] DATETIME DEFAULT GETDATE(),
    [create_by] VARCHAR(50)
);

CREATE INDEX [idx_计划编号] ON [生产计划表]([计划编号]);
CREATE INDEX [idx_计划状态] ON [生产计划表]([计划状态]);
CREATE INDEX [idx_计划开始日期] ON [生产计划表]([计划开始日期]);

-- 2. 生产工单表
CREATE TABLE [生产工单表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [工单编号] VARCHAR(50) NOT NULL UNIQUE,  -- WO-YYYYMMDD-001
    [计划编号] VARCHAR(50),
    [产品类型] VARCHAR(50) NOT NULL,
    [产品型号] VARCHAR(50) NOT NULL,
    [规格] VARCHAR(50),
    [工单数量] INT NOT NULL,
    [已完成数量] INT DEFAULT 0,
    [单位] VARCHAR(10) NOT NULL,
    [产线] VARCHAR(50),  -- 生产线/车间
    [工单状态] VARCHAR(20) DEFAULT N'待生产',  -- 待生产/生产中/已完工/已取消
    [计划开始] DATE NOT NULL,
    [计划结束] DATE NOT NULL,
    [实际开始] DATETIME,
    [实际结束] DATETIME,
    [工序] VARCHAR(20) DEFAULT N'1',  -- 当前工序
    [总工序] VARCHAR(20) DEFAULT N'1',
    [报工备注] VARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    [update_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([计划编号]) REFERENCES [生产计划表]([计划编号])
);

CREATE INDEX [idx_工单编号] ON [生产工单表]([工单编号]);
CREATE INDEX [idx_工单状态] ON [生产工单表]([工单状态]);
CREATE INDEX [idx_计划编号_工单] ON [生产工单表]([计划编号]);

-- 3. 生产报工记录表
CREATE TABLE [生产报工记录表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [工单编号] VARCHAR(50),
    [报工编号] VARCHAR(50) NOT NULL UNIQUE,  -- BG-YYYYMMDD-001
    [报工日期] DATETIME DEFAULT GETDATE(),
    [报工数量] INT NOT NULL,
    [合格数量] INT NOT NULL,
    [不良数量] INT DEFAULT 0,
    [不良原因] VARCHAR(255),
    [工序] VARCHAR(20),
    [报工人] VARCHAR(50) NOT NULL,
    [检验员] VARCHAR(50),
    [备注] VARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([工单编号]) REFERENCES [生产工单表]([工单编号])
);

CREATE INDEX [idx_工单编号_报工] ON [生产报工记录表]([工单编号]);
CREATE INDEX [idx_报工编号] ON [生产报工记录表]([报工编号]);
CREATE INDEX [idx_报工日期] ON [生产报工记录表]([报工日期]);

-- 4. 物料消耗表
CREATE TABLE [物料消耗表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [工单编号] VARCHAR(50),
    [物料编码] VARCHAR(50) NOT NULL,
    [物料名称] VARCHAR(100) NOT NULL,
    [规格型号] VARCHAR(100),
    [消耗数量] DECIMAL(10,2) NOT NULL,
    [单位] VARCHAR(10),
    [领料人] VARCHAR(50),
    [领料日期] DATETIME,
    [备注] VARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([工单编号]) REFERENCES [生产工单表]([工单编号])
);

CREATE INDEX [idx_工单编号_物料] ON [物料消耗表]([工单编号]);
CREATE INDEX [idx_物料编码] ON [物料消耗表]([物料编码]);

-- 5. 质检记录表
CREATE TABLE [质检记录表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [报工编号] VARCHAR(50) NOT NULL UNIQUE,
    [检验日期] DATETIME DEFAULT GETDATE(),
    [检验数量] INT NOT NULL,
    [合格数量] INT NOT NULL,
    [不良数量] INT DEFAULT 0,
    [不良类型] VARCHAR(50),
    [不良原因] VARCHAR(255),
    [检验员] VARCHAR(50) NOT NULL,
    [检验结果] VARCHAR(20) DEFAULT N'待检验',  -- 待检验/合格/不合格
    [处理方式] VARCHAR(50),  -- 返工/报废/特采
    [备注] VARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([报工编号]) REFERENCES [生产报工记录表]([报工编号])
);

CREATE INDEX [idx_报工编号_质检] ON [质检记录表]([报工编号]);
CREATE INDEX [idx_检验结果] ON [质检记录表]([检验结果]);

-- 6. 成品入库表
CREATE TABLE [成品入库表] (
    [id] INT IDENTITY(1,1) PRIMARY KEY,
    [入库编号] VARCHAR(50) NOT NULL UNIQUE,  -- RK-YYYYMMDD-001
    [报工编号] VARCHAR(50),
    [质检编号] VARCHAR(50),
    [产品类型] VARCHAR(50) NOT NULL,
    [产品型号] VARCHAR(50) NOT NULL,
    [入库数量] INT NOT NULL,
    [单位] VARCHAR(10) NOT NULL,
    [入库日期] DATE NOT NULL,
    [库位] VARCHAR(50),
    [入库状态] VARCHAR(20) DEFAULT N'待入库',  -- 待入库/已入库/已取消
    [入库人] VARCHAR(50),
    [备注] VARCHAR(255),
    [create_at] DATETIME DEFAULT GETDATE(),
    [update_at] DATETIME DEFAULT GETDATE(),
    FOREIGN KEY ([报工编号]) REFERENCES [生产报工记录表]([报工编号]),
    FOREIGN KEY ([质检编号]) REFERENCES [质检记录表]([报工编号])
);

CREATE INDEX [idx_入库编号] ON [成品入库表]([入库编号]);
CREATE INDEX [idx_入库状态] ON [成品入库表]([入库状态]);

-- 7. 生产统计视图
GO
CREATE VIEW [生产统计视图] AS
SELECT 
    p.[产品类型],
    p.[产品型号],
    FORMAT(p.[计划开始日期], 'yyyy-MM') AS 月份,
    SUM(p.[计划数量]) AS 计划数量,
    SUM(o.[已完成数量]) AS 完成数量,
    CASE 
        WHEN SUM(p.[计划数量]) > 0 
        THEN ROUND(CAST(SUM(o.[已完成数量]) AS FLOAT) / SUM(p.[计划数量]) * 100, 2)
        ELSE 0 
    END AS 完成率
FROM [生产计划表] p
LEFT JOIN [生产工单表] o ON p.[计划编号] = o.[计划编号]
GROUP BY p.[产品类型], p.[产品型号], FORMAT(p.[计划开始日期], 'yyyy-MM');