import pymssql

# 连接数据库
conn = pymssql.connect('JNS-Server', database='JNS')
cursor = conn.cursor()

# 检查订单表结构
print('订单表字段结构:')
cursor.execute('SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N\'订单表\' ORDER BY ORDINAL_POSITION')
for row in cursor:
    print(row)

# 检查订单列表表结构
print('\n订单列表表字段结构:')
cursor.execute('SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N\'订单列表\' ORDER BY ORDINAL_POSITION')
for row in cursor:
    print(row)

# 关闭连接
cursor.close()
conn.close()
