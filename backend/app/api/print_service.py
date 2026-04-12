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
    填充送货单模板并转换为PDF（支持多页分页）
    每页最多8行数据，超过则分页
    返回 PDF 文件路径
    """
    import win32com.client as win32
    
    template_path = os.path.join(TEMPLATE_DIR, '送货单模板.xlsx')
    unique_id = uuid.uuid4().hex[:8]
    ship_id = shipping_info.get('发货单号', 'unknown')
    
    ITEMS_PER_PAGE = 8
    PAGE_HEADER_ROW = 5
    PAGE_HEADER_ROW2 = 6
    DATA_START_ROW = 8
    TOTAL_ROW = 16
    FOOTER_ROW = 18
    
    items = shipping_info.get('订单项目', [])
    total_pages = (len(items) + ITEMS_PER_PAGE - 1) // ITEMS_PER_PAGE if items else 1
    if total_pages == 0:
        total_pages = 1
    
    base_info = {
        '客户名称': shipping_info.get('客户名称', ''),
        '发货单号': shipping_info.get('发货单号', ''),
        '送货地址': shipping_info.get('送货地址', ''),
        '发货日期': shipping_info.get('发货日期', ''),
        '制单人': shipping_info.get('制单人', 'Admin'),
    }
    
    def fill_single_sheet(sheet, page_num: int, page_items: list, page_total_qty: int):
        sheet.Cells(PAGE_HEADER_ROW, 2).Value = f"客户名称：{base_info['客户名称']}"
        sheet.Cells(PAGE_HEADER_ROW, 9).Value = f"送货单号：{base_info['发货单号']}"
        sheet.Cells(PAGE_HEADER_ROW2, 2).Value = f"送货地址：{base_info['送货地址']}"
        sheet.Cells(PAGE_HEADER_ROW2, 9).Value = f"送货日期：{base_info['发货日期']}"
        
        for i, item in enumerate(page_items):
            row = DATA_START_ROW + i
            sheet.Cells(row, 2).Value = i + 1
            sheet.Cells(row, 3).Value = item.get('合同编号', '')
            sheet.Cells(row, 4).Value = item.get('产品类型', '')
            sheet.Cells(row, 5).Value = item.get('规格', '')
            sheet.Cells(row, 6).Value = item.get('型号', '')
            sheet.Cells(row, 7).Value = item.get('单位', '')
            sheet.Cells(row, 8).Value = item.get('数量', 0)
            sheet.Cells(row, 9).Value = item.get('备注', '')
        
        if page_items:
            sheet.Cells(TOTAL_ROW, 7).Value = page_total_qty
        
        sheet.Cells(FOOTER_ROW, 2).Value = f"制单：{base_info['制单人']}"
        sheet.Cells(FOOTER_ROW, 5).Value = f"第{page_num}页/共{total_pages}页"
        
        page_setup = sheet.PageSetup
        page_setup.PaperSize = 161
        page_setup.Orientation = 1
        page_setup.Zoom = False
        page_setup.FitToPagesWide = 1
        page_setup.FitToPagesTall = False
        page_setup.LeftMargin = 20
        page_setup.RightMargin = 20
        page_setup.TopMargin = 20
        page_setup.BottomMargin = 20
    
    excel = win32.Dispatch('Excel.Application')
    excel.Visible = False
    excel.DisplayAlerts = False
    
    temp_pdf_paths = []
    
    try:
        if total_pages == 1:
            shutil.copy(template_path, os.path.join(TEMP_DIR, f"shipping_{ship_id}_{unique_id}.xlsx"))
            workbook = excel.Workbooks.Open(os.path.abspath(os.path.join(TEMP_DIR, f"shipping_{ship_id}_{unique_id}.xlsx")))
            ws = workbook.Worksheets(1)
            
            page_items = items[:ITEMS_PER_PAGE]
            page_qty = sum(item.get('数量', 0) for item in page_items)
            fill_single_sheet(ws, 1, page_items, page_qty)
            workbook.Save()
            
            pdf_filename = f"shipping_{ship_id}_{unique_id}.pdf"
            pdf_path = os.path.join(TEMP_DIR, pdf_filename)
            workbook.Worksheets(1).ExportAsFixedFormat(0, os.path.abspath(pdf_path))
            workbook.Close(False)
            excel.Quit()
            
            os.remove(os.path.join(TEMP_DIR, f"shipping_{ship_id}_{unique_id}.xlsx"))
            
            logger.info(f"PDF created: {pdf_path}, pages: {total_pages}")
            return f"/temp/{pdf_filename}"
        
        for page_num in range(1, total_pages + 1):
            start_idx = (page_num - 1) * ITEMS_PER_PAGE
            end_idx = start_idx + ITEMS_PER_PAGE
            page_items = items[start_idx:end_idx]
            page_qty = sum(item.get('数量', 0) for item in page_items)
            
            shutil.copy(template_path, os.path.join(TEMP_DIR, f"shipping_{ship_id}_{unique_id}_page{page_num}.xlsx"))
            workbook = excel.Workbooks.Open(os.path.abspath(os.path.join(TEMP_DIR, f"shipping_{ship_id}_{unique_id}_page{page_num}.xlsx")))
            ws = workbook.Worksheets(1)
            
            fill_single_sheet(ws, page_num, page_items, page_qty)
            workbook.Save()
            
            temp_pdf = os.path.join(TEMP_DIR, f"shipping_{ship_id}_{unique_id}_page{page_num}.pdf")
            workbook.Worksheets(1).ExportAsFixedFormat(0, os.path.abspath(temp_pdf))
            workbook.Close(False)
            
            os.remove(os.path.join(TEMP_DIR, f"shipping_{ship_id}_{unique_id}_page{page_num}.xlsx"))
            temp_pdf_paths.append(temp_pdf)
        
        excel.Quit()
        
        pdf_filename = f"shipping_{ship_id}_{unique_id}.pdf"
        pdf_path = os.path.join(TEMP_DIR, pdf_filename)
        
        from PyPDF2 import PdfMerger
        merger = PdfMerger()
        for temp_pdf in temp_pdf_paths:
            merger.append(temp_pdf)
        merger.write(pdf_path)
        merger.close()
        
        for temp_pdf in temp_pdf_paths:
            if os.path.exists(temp_pdf):
                os.remove(temp_pdf)
        
        logger.info(f"PDF created: {pdf_path}, pages: {total_pages}")
        return f"/temp/{pdf_filename}"
        
    except Exception as e:
        try:
            excel.Quit()
        except:
            pass
        raise e


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
async def preview_pdf(path: str = Query(...), download: bool = False):
    """预览PDF文件"""
    filename = os.path.basename(path)
    pdf_path = os.path.join(TEMP_DIR, filename)
    
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    parts = filename.replace('.pdf', '').split('_')
    if len(parts) >= 3 and parts[0] == 'shipping':
        download_name = f"{parts[1]}.pdf"
    else:
        download_name = filename
    
    from fastapi.responses import FileResponse
    if download:
        headers = {'Content-Disposition': f'attachment; filename*=UTF-8\'\'{download_name}'}
        return FileResponse(pdf_path, media_type='application/pdf', headers=headers)
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
