import logging
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
import uuid

from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.core.response import success_response, error_response
from app.services.ship_service import ship_service

logger = logging.getLogger(__name__)

router = APIRouter()

# 模板目录和临时目录
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'public', 'templates')
TEMP_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'temp')
os.makedirs(TEMP_DIR, exist_ok=True)





def resize_pdf_page(input_path: str, output_path: str, width_mm: float, height_mm: float):
    """
    使用 PyPDF2 调整 PDF 页面尺寸并缩放内容
    """
    from PyPDF2 import PdfReader, PdfWriter, Transformation
    
    target_width_pt = width_mm * 72 / 25.4
    target_height_pt = height_mm * 72 / 25.4
    
    reader = PdfReader(input_path)
    writer = PdfWriter()
    
    for page in reader.pages:
        orig_width = float(page.mediabox.width)
        orig_height = float(page.mediabox.height)
        
        # 计算缩放比例
        scale_x = target_width_pt / orig_width
        scale_y = target_height_pt / orig_height
        
        # 创建新页面
        new_page = writer.add_blank_page(width=target_width_pt, height=target_height_pt)
        
        # 应用缩放变换并合并
        transform = Transformation().scale(scale_x, scale_y)
        new_page.add_transformation(transform)
        new_page.merge_page(page)
    
    with open(output_path, 'wb') as f:
        writer.write(f)
    
    logger.info(f"PDF resized and scaled to {width_mm}mm x {height_mm}mm")


def fill_and_convert_shipping(shipping_info: dict) -> str:
    """
    填充送货单模板并转换为PDF
    返回 PDF 文件路径
    """
    import win32com.client as win32
    
    # 复制模板
    template_path = os.path.join(TEMPLATE_DIR, '送货单模板.xlsx')
    unique_id = uuid.uuid4().hex[:8]
    ship_id = shipping_info.get('发货单号', 'unknown')
    excel_filename = f"shipping_{ship_id}_{unique_id}.xlsx"
    excel_path = os.path.join(TEMP_DIR, excel_filename)
    shutil.copy(template_path, excel_path)
    
    # 用 win32com 直接操作 Excel
    excel = win32.Dispatch('Excel.Application')
    excel.Visible = False
    excel.DisplayAlerts = False
    
    try:
        workbook = excel.Workbooks.Open(os.path.abspath(excel_path))
        ws = workbook.Worksheets(1)
        
        # 填充基本信息
        # B5: 客户名称, I5: 送货单号
        # B6: 送货地址, I6: 送货日期
        ws.Cells(5, 2).Value = f"客户名称：{shipping_info.get('客户名称', '')}"
        ws.Cells(5, 9).Value = f"送货单号：{shipping_info.get('发货单号', '')}"
        ws.Cells(6, 2).Value = f"送货地址：{shipping_info.get('送货地址', '')}"
        ws.Cells(6, 9).Value = f"送货日期：{shipping_info.get('发货日期', '')}"
        
        # 填充数据行 (第8-15行)
        # B: 序号, C: 合同编号, D: 产品类型, E: 规格, F: 型号, G: 单位, H: 数量, I: 备注
        items = shipping_info.get('订单项目', [])
        for i, item in enumerate(items[:8]):  # 最多8行
            row = 8 + i
            ws.Cells(row, 2).Value = i + 1  # 序号
            ws.Cells(row, 3).Value = item.get('合同编号', '')
            ws.Cells(row, 4).Value = item.get('产品类型', '')
            ws.Cells(row, 5).Value = item.get('规格', '')
            ws.Cells(row, 6).Value = item.get('型号', '')
            ws.Cells(row, 7).Value = item.get('单位', '')
            ws.Cells(row, 8).Value = item.get('数量', 0)
            ws.Cells(row, 9).Value = item.get('备注', '')
        
        # 计算并填充总数量 (G16)
        if items:
            total_qty = sum(item.get('数量', 0) for item in items)
            ws.Cells(16, 7).Value = total_qty
        
        # 填充页脚 (第18行)
        # B18: 制单人, E18: 页码
        ws.Cells(18, 2).Value = f"制单：{shipping_info.get('制单人', 'Admin')}"
        ws.Cells(18, 5).Value = "第1页/共1页"
        
        # 设置页面尺寸为二等分连续纸 (161)
        page_setup = ws.PageSetup
        page_setup.PaperSize = 161  # 二等分连续纸
        page_setup.Orientation = 1  # 纵向
        page_setup.Zoom = False
        page_setup.FitToPagesWide = 1
        page_setup.FitToPagesTall = False
        page_setup.LeftMargin = 20
        page_setup.RightMargin = 20
        page_setup.TopMargin = 20
        page_setup.BottomMargin = 20
        
        # 保存 Excel
        workbook.Save()
        
        # 转换为 PDF
        pdf_filename = f"shipping_{ship_id}_{unique_id}.pdf"
        pdf_path = os.path.join(TEMP_DIR, pdf_filename)
        workbook.Worksheets(1).ExportAsFixedFormat(0, os.path.abspath(pdf_path))
        
        workbook.Close(False)
        
    finally:
        excel.Quit()
    
    # 删除临时 Excel 文件
    if os.path.exists(excel_path):
        os.remove(excel_path)
    
    logger.info(f"PDF created: {pdf_path}")
    return f"/temp/{pdf_filename}"


@router.get("/shipping/{ship_id}")
async def print_shipping(
    ship_id: str,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """
    打印送货单：查询数据 → 填充模板 → 转PDF → 返回预览URL
    
    流程：
    1. 根据发货单号查询数据库获取发货单详情
    2. 复制Excel模板，用win32com填写数据
    3. 转换为PDF
    4. 返回PDF预览路径
    """
    try:
        # 1. 查询发货单数据
        shipping_info, error = ship_service.get_shipping_detail(db, ship_id)
        if error:
            return error_response(msg=error)
        
        # 添加制单人
        shipping_info['制单人'] = f"{current_user.last_name or ''}{current_user.first_name or ''}" or current_user.username
        
        logger.info(f"打印发货单: {ship_id}, 项目数: {len(shipping_info.get('订单项目', []))}")
        
        # 2. 填充模板并转换为 PDF
        pdf_path = fill_and_convert_shipping(shipping_info)
        
        return success_response(data={"pdf_path": pdf_path})
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(msg=f"打印失败: {str(e)}")


@router.get("/preview-pdf")
async def preview_pdf(path: str = Query(...)):
    """预览PDF文件"""
    filename = os.path.basename(path)
    pdf_path = os.path.join(TEMP_DIR, filename)
    
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    from fastapi.responses import FileResponse
    return FileResponse(pdf_path, media_type='application/pdf')


@router.post("/cleanup")
async def cleanup_pdf(paths: List[str] = Body(...)):
    """清理临时PDF文件"""
    cleaned = []
    for path in paths:
        try:
            filename = os.path.basename(path)
            full_path = os.path.join(TEMP_DIR, filename)
            if os.path.exists(full_path):
                os.remove(full_path)
                cleaned.append(filename)
        except Exception as e:
            logger.error(f"清理失败 {path}: {e}")
    
    return success_response(data={"cleaned": cleaned})
