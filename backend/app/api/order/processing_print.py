from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db_jns
from app.models.order import Order, OrderList
from app.models.dict import DictData

router = APIRouter()


def get_pitch_from_dict(product_type: str, db: Session) -> str:
    """根据产品类型查字典获取节距"""
    if not product_type:
        return ''
    
    # 从产品类型中提取前缀（如 "MXL同步带" -> "MXL"）
    # 假设产品类型格式为 "前缀+中文后缀"
    prefix = product_type
    for i, char in enumerate(product_type):
        if '\u4e00' <= char <= '\u9fff':  # 如果遇到汉字
            prefix = product_type[:i]
            break
    
    if not prefix:
        return ''
    
    # 查询字典获取节距
    dict_data = db.query(DictData).filter(
        DictData.dict_type == 'sync_belt_pitch',
        DictData.dict_label == prefix,
        DictData.available == True
    ).first()
    
    if dict_data:
        return dict_data.dict_value or ''
    return ''


def parse_model_number(model: str) -> dict:
    """解析型号提取宽度和长度
    型号格式："宽度-长度-节距" 或 "宽度-长度"
    示例："10-20-30" -> 宽度=10, 长度=30
          "10-20"    -> 宽度=10, 长度=20
    """
    if not model:
        return {'宽度': '', '长度': ''}
    
    parts = model.split('-')
    if len(parts) >= 2:
        return {
            '宽度': parts[0],
            '长度': parts[-1]  # 最后一个部分作为长度
        }
    elif len(parts) == 1:
        return {
            '宽度': parts[0],
            '长度': ''
        }
    return {'宽度': '', '长度': ''}


@router.get("/processing-print/{order_id}", response_model=dict)
async def get_processing_order_print(
    order_id: int,
    db: Session = Depends(get_db_jns)
):
    """获取加工单打印数据"""
    try:
        # 获取订单列表信息
        order_list = db.query(OrderList).filter(OrderList.id == order_id).first()
        if not order_list:
            return {"code": 1, "msg": "订单不存在", "data": {}}
        
        # 获取订单分项数据
        order_items = db.query(Order).filter(Order.oid == order_id).all()
        
        if not order_items:
            return {"code": 1, "msg": "没有订单分项数据", "data": {}}
        
        # 处理每条分项数据
        processed_items = []
        for item in order_items:
            # 解析型号
            model_info = parse_model_number(item.型号 or '')
            
            # 获取节距
            pitch = get_pitch_from_dict(item.产品类型 or '', db)
            
            processed_item = {
                '产品类型': item.产品类型 or '',
                '规格': item.规格 or '',
                '宽度': model_info['宽度'],
                '长度': model_info['长度'],
                '节距': pitch,
                '数量': item.数量 or 0,
                '单位': item.单位 or '',
                '备注': item.备注 or '',
            }
            processed_items.append(processed_item)
        
        # 计算分页（每页5条）
        items_per_page = 5
        total_items = len(processed_items)
        total_pages = (total_items + items_per_page - 1) // items_per_page if total_items > 0 else 1
        
        return {
            "code": 0,
            "msg": "success",
            "data": {
                "工单编号": order_list.订单编号,
                "客户名称": order_list.客户名称,
                "items": processed_items,
                "total_items": total_items,
                "total_pages": total_pages,
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"code": 1, "msg": f"获取打印数据失败: {str(e)}", "data": {}}
