import pymssql
import datetime

# 连接数据库
conn = pymssql.connect('JNS-Server', database='JNS')
cursor = conn.cursor()

# 准备测试数据
test_data = {
    'oid': 110240,
    '订单编号': 'DH-20260403-027',
    '合同编号': 'TEST1',
    '订单日期': '2026-04-03',
    '交货日期': '2026-04-03',
    '规格': 'TEST1',
    '产品类型': 'TEST1',
    '型号': 'TEST1',
    '数量': 1,
    '单位': '米',
    '销售单价': 2,
    '备注': 'TEST1',
    '客户名称': '东莞曹燕平',
    '结算方式': '',
    '发货单号': '',
    '快递单号': '',
    '客户物料编号': 'TEST1',
    '外购': 0
}

# 尝试插入数据
try:
    print("尝试插入订单子项目记录...")
    sql = """
    INSERT INTO 订单表 (oid, 订单编号, 合同编号, 订单日期, 交货日期, 规格, 产品类型, 型号, 数量, 单位, 销售单价, 备注, 客户名称, 结算方式, 发货单号, 快递单号, 客户物料编号, 外购)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql, (
        test_data['oid'],
        test_data['订单编号'],
        test_data['合同编号'],
        test_data['订单日期'],
        test_data['交货日期'],
        test_data['规格'],
        test_data['产品类型'],
        test_data['型号'],
        test_data['数量'],
        test_data['单位'],
        test_data['销售单价'],
        test_data['备注'],
        test_data['客户名称'],
        test_data['结算方式'],
        test_data['发货单号'],
        test_data['快递单号'],
        test_data['客户物料编号'],
        test_data['外购']
    ))
    conn.commit()
    print("插入成功！")
except Exception as e:
    print(f"插入失败: {e}")
    conn.rollback()
finally:
    cursor.close()
    conn.close()
