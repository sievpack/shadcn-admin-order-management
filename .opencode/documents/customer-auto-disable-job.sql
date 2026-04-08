-- =====================================================
-- 客户自动停用定时任务脚本
-- 用于自动将超过半年未交易的客户状态设置为停用
-- =====================================================

-- 1. 停用超过6个月未交易的客户
-- 逻辑：查找最后交易时间超过6个月的活跃客户，将其状态改为"停用"
UPDATE 客户信息表
SET 状态 = '停用', update_at = GETDATE()
WHERE 状态 = '活跃'
AND EXISTS (
    SELECT 1 FROM 订单列表
    WHERE 订单列表.客户名称 = 客户信息表.客户名称
    AND 订单日期 < DATEADD(MONTH, -6, GETDATE())
)
AND NOT EXISTS (
    SELECT 1 FROM 订单列表
    WHERE 订单列表.客户名称 = 客户信息表.客户名称
    AND 订单日期 >= DATEADD(MONTH, -6, GETDATE())
);

-- 2. 查看需要停用的客户列表（预览）
SELECT 
    客户信息表.id,
    客户信息表.客户名称,
    客户信息表.状态,
    MAX(订单列表.订单日期) AS 最后交易日期,
    DATEDIFF(MONTH, MAX(订单列表.订单日期), GETDATE()) AS 未交易月数
FROM 客户信息表
LEFT JOIN 订单列表 ON 客户信息表.客户名称 = 订单列表.客户名称
WHERE 客户信息表.状态 = '活跃'
GROUP BY 客户信息表.id, 客户信息表.客户名称, 客户信息表.状态
HAVING MAX(订单列表.订单日期) < DATEADD(MONTH, -6, GETDATE())
    OR MAX(订单列表.订单日期) IS NULL;

-- =====================================================
-- SQL Server Agent 作业配置说明：
-- =====================================================
-- 
-- 1. 打开 SSMS，展开 "SQL Server Agent" -> 右键 "Jobs" -> "New Job"
--
-- 2. 基本信息：
--    Name: 停用长期未交易客户
--    Category: Database Maintenance
--    Owner: sa
--
-- 3. Steps：
--    Step Name: Update_Customer_Status
--    Type: Transact-SQL script (T-SQL)
--    Database: JNS
--    Command: 粘贴上面的 UPDATE 语句
--
-- 4. Schedules：
--    Name: Daily_2AM
--    Frequency: Daily
--    Occurs: 每天 at 2:00:00 AM
--
-- 5. 建议执行时间：凌晨 2:00（业务低峰期）
--
-- =====================================================
-- 扩展：可添加更多自动任务
-- =====================================================

-- 示例：自动删除超过1年的日志
-- DELETE FROM SystemLogs WHERE CreatedAt < DATEADD(YEAR, -1, GETDATE());

-- 示例：自动归档超过6个月的订单
-- UPDATE 订单列表 SET status = '归档' WHERE 订单日期 < DATEADD(MONTH, -6, GETDATE()) AND status = '已完成';