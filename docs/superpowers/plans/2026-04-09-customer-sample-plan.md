# 客户样品页面实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现客户样品页面的增删改查、筛选和 PDF 导出功能

**Architecture:** 采用现有的客户资料模块作为参考模式，使用 TanStack Table 的展开行功能实现主子表格，后端遵循 API → Service → Repository 三层架构

**Tech Stack:** React 19 + TanStack Table + shadcn/ui + FastAPI + SQLAlchemy + @react-pdf/renderer

---

## 文件结构

### 后端文件
- `backend/app/models/customer_sample.py` - 模型（如果不存在）
- `backend/app/repositories/customer_sample_repository.py` - Repository 层
- `backend/app/services/customer_sample_service.py` - Service 层
- `backend/app/api/customer_sample.py` - API 层

### 前端文件
- `src/features/customer-sample/index.tsx` - 页面入口
- `src/features/customer-sample/components/customer-sample-provider.tsx` - 状态管理
- `src/features/customer-sample/components/customer-sample-columns.tsx` - 列定义
- `src/features/customer-sample/components/customer-sample-table.tsx` - 表格组件
- `src/features/customer-sample/components/customer-sample-dialogs.tsx` - 对话框集合
- `src/features/customer-sample/components/customer-sample-form-dialog.tsx` - 表单对话框
- `src/features/customer-sample/components/customer-sample-detail-dialog.tsx` - 详情对话框
- `src/features/customer-sample/components/customer-sample-delete-dialog.tsx` - 删除确认
- `src/features/customer-sample/components/customer-sample-pdf.tsx` - PDF 导出
- `src/features/customer-sample/components/data-table-row-actions.tsx` - 行操作

- `src/routes/_authenticated/customer-sample/index.tsx` - 路由
- `src/lib/api.ts` - API 调用（添加 customerSample API）

---

## Task 1: 创建后端 Repository 层

**Files:**
- Create: `backend/app/repositories/customer_sample_repository.py`

- [ ] **Step 1: 创建 customer_sample_repository.py**

```python
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Tuple
from app.repositories.base_repository import BaseRepository


class CustomerSampleRepository(BaseRepository):
    def __init__(self):
        super().__init__(None)  # 暂不指定 model

    def search(
        self,
        db: Session,
        search: str = None,
        客户名称: str = None,
        产品类型: str = None,
        start_date: str = None,
        end_date: str = None,
        page: int = 1,
        page_size: int = 10
    ) -> Tuple[List, int]:
        """搜索客户样品"""
        from app.models.customer_sample import CustomerSample
        q = db.query(CustomerSample)

        if search:
            search_pattern = f"%{search}%"
            q = q.filter(
                or_(
                    CustomerSample.样品单号.like(search_pattern),
                    CustomerSample.客户名称.like(search_pattern),
                )
            )

        if 客户名称:
            q = q.filter(CustomerSample.客户名称.like(f"%{客户名称}%"))

        if 产品类型:
            q = q.filter(CustomerSample.产品类型.like(f"%{产品类型}%"))

        if start_date:
            q = q.filter(CustomerSample.下单日期 >= start_date)

        if end_date:
            q = q.filter(CustomerSample.下单日期 <= end_date)

        total = q.count()
        items = q.order_by(desc(CustomerSample.id)).offset((page - 1) * page_size).limit(page_size).all()
        return items, total

    def get_by_id(self, db: Session, id: int):
        """根据 ID 获取"""
        from app.models.customer_sample import CustomerSample
        return db.query(CustomerSample).filter(CustomerSample.id == id).first()

    def create(self, db: Session, data: dict):
        """创建"""
        from app.models.customer_sample import CustomerSample
        obj = CustomerSample(**data)
        db.add(obj)
        db.flush()
        return obj

    def update(self, db: Session, obj, data: dict):
        """更新"""
        for key, value in data.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        db.flush()
        return obj

    def delete(self, db: Session, id: int):
        """删除"""
        from app.models.customer_sample import CustomerSample
        obj = db.query(CustomerSample).filter(CustomerSample.id == id).first()
        if obj:
            db.delete(obj)
        db.flush()


customer_sample_repository = CustomerSampleRepository()
```

- [ ] **Step 2: 更新 repositories/__init__.py 导出**

在 `backend/app/repositories/__init__.py` 中添加：
```python
from app.repositories.customer_sample_repository import customer_sample_repository
__all__ = [..., "customer_sample_repository"]
```

---

## Task 2: 创建后端 Service 层

**Files:**
- Create: `backend/app/services/customer_sample_service.py`

- [ ] **Step 1: 创建 customer_sample_service.py**

```python
from typing import Optional, Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.customer_sample_repository import customer_sample_repository


class CustomerSampleService:
    def __init__(self):
        self.repo = customer_sample_repository

    def search(
        self,
        db: Session,
        search: str = None,
        客户名称: str = None,
        产品类型: str = None,
        start_date: str = None,
        end_date: str = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List, int]:
        return self.repo.search(
            db, search=search, 客户名称=客户名称, 产品类型=产品类型,
            start_date=start_date, end_date=end_date,
            page=page, page_size=page_size
        )

    def get(self, db: Session, id: int):
        return self.repo.get_by_id(db, id)

    def create(self, db: Session, **kwargs) -> Tuple[Optional[Any], Optional[str]]:
        try:
            obj = self.repo.create(db, kwargs)
            db.commit()
            return obj, None
        except Exception as e:
            db.rollback()
            return None, str(e)

    def update(self, db: Session, id: int, **kwargs) -> Tuple[Optional[Any], Optional[str]]:
        obj = self.repo.get_by_id(db, id)
        if not obj:
            return None, "记录不存在"
        try:
            self.repo.update(db, obj, kwargs)
            db.commit()
            return obj, None
        except Exception as e:
            db.rollback()
            return None, str(e)

    def delete(self, db: Session, id: int) -> Tuple[bool, Optional[str]]:
        obj = self.repo.get_by_id(db, id)
        if not obj:
            return False, "记录不存在"
        try:
            self.repo.delete(db, id)
            db.commit()
            return True, None
        except Exception as e:
            db.rollback()
            return False, str(e)

    def to_dict(self, obj) -> Dict[str, Any]:
        return {
            'id': obj.id,
            '客户名称': obj.客户名称,
            '样品单号': obj.样品单号,
            '下单日期': obj.下单日期.strftime('%Y-%m-%d') if obj.下单日期 else None,
            '需求日期': obj.需求日期.strftime('%Y-%m-%d') if obj.需求日期 else None,
            '规格': obj.规格,
            '产品类型': obj.产品类型,
            '型号': obj.型号,
            '单位': obj.单位,
            '数量': float(obj.数量) if obj.数量 else 0,
            '齿形': obj.齿形,
            '材料': obj.材料,
            '喷码要求': obj.喷码要求,
            '备注': obj.备注,
            '钢丝': obj.钢丝,
        }


customer_sample_service = CustomerSampleService()
```

- [ ] **Step 2: 更新 services/__init__.py 导出**

在 `backend/app/services/__init__.py` 中添加：
```python
from app.services.customer_sample_service import customer_sample_service
__all__ = [..., "customer_sample_service"]
```

---

## Task 3: 创建后端 API 层

**Files:**
- Create: `backend/app/api/customer_sample.py`

- [ ] **Step 1: 创建 customer_sample.py**

```python
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db_jns
from app.models.user import User
from app.api.auth import get_current_active_user
from app.services.customer_sample_service import customer_sample_service

router = APIRouter()


@router.get("/list")
async def get_list(
    search: Optional[str] = Query(None, description="全局搜索"),
    客户名称: Optional[str] = Query(None, description="客户名称"),
    产品类型: Optional[str] = Query(None, description="产品类型"),
    start_date: Optional[str] = Query(None, description="开始日期"),
    end_date: Optional[str] = Query(None, description="结束日期"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取客户样品列表"""
    try:
        items, total = customer_sample_service.search(
            db, search=search, 客户名称=客户名称, 产品类型=产品类型,
            start_date=start_date, end_date=end_date,
            page=page, page_size=limit
        )
        data = [customer_sample_service.to_dict(item) for item in items]
        return {"code": 0, "msg": "success", "count": total, "data": data}
    except Exception as e:
        return {"code": 1, "msg": f"获取失败: {str(e)}", "count": 0, "data": []}


@router.get("/{id}")
async def get_detail(
    id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """获取客户样品详情"""
    try:
        obj = customer_sample_service.get(db, id)
        if not obj:
            return {"code": 1, "msg": "记录不存在", "count": 0, "data": {}}
        return {"code": 0, "msg": "success", "count": 1, "data": customer_sample_service.to_dict(obj)}
    except Exception as e:
        return {"code": 1, "msg": f"获取失败: {str(e)}", "count": 0, "data": {}}


@router.post("/create")
async def create(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """创建客户样品"""
    obj, error = customer_sample_service.create(db, **data)
    if error:
        return {"code": 1, "msg": error, "data": {}}
    return {"code": 0, "msg": "创建成功", "data": {"id": obj.id}}


@router.put("/update")
async def update(
    data: dict,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """更新客户样品"""
    id = data.get('id')
    if not id:
        return {"code": 1, "msg": "缺少ID", "data": {}}
    obj, error = customer_sample_service.update(db, id, **data)
    if error:
        return {"code": 1, "msg": error, "data": {}}
    return {"code": 0, "msg": "更新成功", "data": {"id": obj.id}}


@router.delete("/{id}")
async def delete(
    id: int,
    db: Session = Depends(get_db_jns),
    current_user: User = Depends(get_current_active_user)
):
    """删除客户样品"""
    success, error = customer_sample_service.delete(db, id)
    if not success:
        return {"code": 1, "msg": error, "data": {}}
    return {"code": 0, "msg": "删除成功", "data": {}}
```

- [ ] **Step 2: 注册路由**

在 `backend/app/main.py` 中添加路由注册：
```python
from app.api.customer_sample import router as customer_sample_router
app.include_router(customer_sample_router, prefix="/customer-sample", tags=["客户样品"])
```

---

## Task 4: 创建前端 Provider

**Files:**
- Create: `src/features/customer-sample/components/customer-sample-provider.tsx`

- [ ] **Step 1: 创建 customer-sample-provider.tsx**

```tsx
import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'

export type CustomerSample = {
  id: number
  客户名称: string
  样品单号: string
  下单日期: string
  需求日期?: string
  规格: string
  产品类型: string
  型号: string
  单位: string
  数量: number
  齿形?: string
  材料?: string
  喷码要求?: string
  备注?: string
  钢丝?: string
}

type CustomerSampleDialogType = 'view' | 'edit' | 'add' | 'delete'

type CustomerSampleContextType = {
  open: CustomerSampleDialogType | null
  setOpen: (str: CustomerSampleDialogType | null) => void
  currentRow: CustomerSample | null
  setCurrentRow: React.Dispatch<React.SetStateAction<CustomerSample | null>>
  refreshData: () => void
  setRefreshData: React.Dispatch<React.SetStateAction<() => void>>
}

const CustomerSampleContext = React.createContext<CustomerSampleContextType | null>(null)

export function CustomerSampleProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<CustomerSampleDialogType>(null)
  const [currentRow, setCurrentRow] = useState<CustomerSample | null>(null)
  const [refreshData, setRefreshData] = useState<() => void>(() => {})

  return (
    <CustomerSampleContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow, refreshData, setRefreshData }}
    >
      {children}
    </CustomerSampleContext.Provider>
  )
}

export const useCustomerSample = () => {
  const context = React.useContext(CustomerSampleContext)
  if (!context) {
    throw new Error('useCustomerSample must be used within CustomerSampleProvider')
  }
  return context
}
```

---

## Task 5: 创建前端 API

**Files:**
- Modify: `src/lib/api.ts`

- [ ] **Step 1: 在 api.ts 中添加 customerSample API**

找到 api.ts 中现有的 API 定义，添加：

```typescript
customerSample: {
  getList: (params?: {
    search?: string
    客户名称?: string
    产品类型?: string
    start_date?: string
    end_date?: string
    page?: number
    limit?: number
  }) => api.get('/customer-sample/list', { params }),
  getDetail: (id: number) => api.get(`/customer-sample/${id}`),
  create: (data: any) => api.post('/customer-sample/create', data),
  update: (data: any) => api.put('/customer-sample/update', data),
  delete: (id: number) => api.delete(`/customer-sample/${id}`),
},
```

---

## Task 6: 创建前端列定义

**Files:**
- Create: `src/features/customer-sample/components/customer-sample-columns.tsx`

- [ ] **Step 1: 创建 customer-sample-columns.tsx**

```tsx
import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableRowActions } from './data-table-row-actions'
import { type CustomerSample } from './customer-sample-provider'

export function customerSampleColumns({
  onView,
  onEdit,
  onDelete,
}: {
  onView?: (row: CustomerSample) => void
  onEdit?: (row: CustomerSample) => void
  onDelete?: (row: CustomerSample) => void
}): ColumnDef<CustomerSample>[] {
  return [
    {
      accessorKey: '样品单号',
      header: '样品单号',
      cell: ({ row }) => <div className="font-medium">{row.getValue('样品单号')}</div>,
    },
    {
      accessorKey: '客户名称',
      header: '客户名称',
    },
    {
      accessorKey: '下单日期',
      header: '下单日期',
      cell: ({ row }) => <div>{row.getValue('下单日期') || '-'}</div>,
    },
    {
      accessorKey: '需求日期',
      header: '需求日期',
      cell: ({ row }) => <div>{row.getValue('需求日期') || '-'}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          row={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ]
}
```

---

## Task 7: 创建行操作组件

**Files:**
- Create: `src/features/customer-sample/components/data-table-row-actions.tsx`

- [ ] **Step 1: 创建 data-table-row-actions.tsx**

```tsx
import { Eye, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type CustomerSample } from './customer-sample-provider'

export function DataTableRowActions({
  row,
  onView,
  onEdit,
  onDelete,
}: {
  row: CustomerSample
  onView?: (row: CustomerSample) => void
  onEdit?: (row: CustomerSample) => void
  onDelete?: (row: CustomerSample) => void
}) {
  return (
    <div className="flex gap-1">
      {onView && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(row)}>
          <Eye className="h-4 w-4" />
        </Button>
      )}
      {onEdit && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(row)}>
          <Edit className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => onDelete(row)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
```

---

## Task 8: 创建表单对话框

**Files:**
- Create: `src/features/customer-sample/components/customer-sample-form-dialog.tsx`

- [ ] **Step 1: 创建 customer-sample-form-dialog.tsx**

```tsx
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { customerSampleAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type CustomerSample } from './customer-sample-provider'

const schema = z.object({
  客户名称: z.string().min(1, '客户名称不能为空'),
  样品单号: z.string().min(1, '样品单号不能为空'),
  下单日期: z.string().min(1, '下单日期不能为空'),
  需求日期: z.string().optional(),
  规格: z.string().min(1, '规格不能为空'),
  产品类型: z.string().min(1, '产品类型不能为空'),
  型号: z.string().min(1, '型号不能为空'),
  单位: z.string().min(1, '单位不能为空'),
  数量: z.number().min(1, '数量不能为空'),
  齿形: z.string().optional(),
  材料: z.string().optional(),
  喷码要求: z.string().optional(),
  备注: z.string().optional(),
  钢丝: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CustomerSampleFormDialog({
  open,
  onOpenChange,
  data,
  onSuccess,
  mode,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: CustomerSample | null
  onSuccess: () => void
  mode: 'add' | 'edit'
}) {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      客户名称: '',
      样品单号: '',
      下单日期: '',
      需求日期: '',
      规格: '',
      产品类型: '',
      型号: '',
      单位: '条',
      数量: 1,
      齿形: '',
      材料: '',
      喷码要求: '',
      备注: '',
      钢丝: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && data) {
        form.reset(data)
      } else {
        form.reset({
          客户名称: '',
          样品单号: '',
          下单日期: '',
          需求日期: '',
          规格: '',
          产品类型: '',
          型号: '',
          单位: '条',
          数量: 1,
          齿形: '',
          材料: '',
          喷码要求: '',
          备注: '',
          钢丝: '',
        })
      }
    }
  }, [open, mode, data])

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    try {
      if (mode === 'add') {
        await customerSampleAPI.create(formData)
        toast.success('创建成功')
      } else {
        await customerSampleAPI.update({ id: data!.id, ...formData })
        toast.success('更新成功')
      }
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? '新增样品' : '编辑样品'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? '创建新的客户样品' : '修改客户样品信息'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>客户名称</Label>
              <Input {...form.register('客户名称')} />
            </div>
            <div>
              <Label>样品单号</Label>
              <Input {...form.register('样品单号')} />
            </div>
            <div>
              <Label>下单日期</Label>
              <Input type="date" {...form.register('下单日期')} />
            </div>
            <div>
              <Label>需求日期</Label>
              <Input type="date" {...form.register('需求日期')} />
            </div>
            <div>
              <Label>规格</Label>
              <Input {...form.register('规格')} />
            </div>
            <div>
              <Label>产品类型</Label>
              <Input {...form.register('产品类型')} />
            </div>
            <div>
              <Label>型号</Label>
              <Input {...form.register('型号')} />
            </div>
            <div>
              <Label>单位</Label>
              <Input {...form.register('单位')} />
            </div>
            <div>
              <Label>数量</Label>
              <Input type="number" {...form.register('数量', { valueAsNumber: true })} />
            </div>
            <div>
              <Label>齿形</Label>
              <Input {...form.register('齿形')} />
            </div>
            <div>
              <Label>材料</Label>
              <Input {...form.register('材料')} />
            </div>
            <div>
              <Label>钢丝</Label>
              <Input {...form.register('钢丝')} />
            </div>
          </div>
          <div>
            <Label>喷码要求</Label>
            <Input {...form.register('喷码要求')} />
          </div>
          <div>
            <Label>备注</Label>
            <Textarea {...form.register('备注')} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Task 9: 创建详情对话框

**Files:**
- Create: `src/features/customer-sample/components/customer-sample-detail-dialog.tsx`

- [ ] **Step 1: 创建 customer-sample-detail-dialog.tsx**

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type CustomerSample } from './customer-sample-provider'

export function CustomerSampleDetailDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: CustomerSample | null
}) {
  if (!data) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>样品详情</DialogTitle>
          <DialogDescription>样品单号：{data.样品单号}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">客户名称：</span>{data.客户名称}</div>
          <div><span className="font-medium">下单日期：</span>{data.下单日期}</div>
          <div><span className="font-medium">需求日期：</span>{data.需求日期 || '-'}</div>
          <div><span className="font-medium">规格：</span>{data.规格}</div>
          <div><span className="font-medium">产品类型：</span>{data.产品类型}</div>
          <div><span className="font-medium">型号：</span>{data.型号}</div>
          <div><span className="font-medium">单位：</span>{data.单位}</div>
          <div><span className="font-medium">数量：</span>{data.数量}</div>
          <div><span className="font-medium">齿形：</span>{data.齿形 || '-'}</div>
          <div><span className="font-medium">材料：</span>{data.材料 || '-'}</div>
          <div><span className="font-medium">钢丝：</span>{data.钢丝 || '-'}</div>
          <div><span className="font-medium">喷码要求：</span>{data.喷码要求 || '-'}</div>
          <div className="col-span-2"><span className="font-medium">备注：</span>{data.备注 || '-'}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Task 10: 创建删除对话框

**Files:**
- Create: `src/features/customer-sample/components/customer-sample-delete-dialog.tsx`

- [ ] **Step 1: 创建 customer-sample-delete-dialog.tsx**

```tsx
import { useState } from 'react'
import { toast } from 'sonner'
import { customerSampleAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { type CustomerSample } from './customer-sample-provider'

export function CustomerSampleDeleteDialog({
  open,
  onOpenChange,
  data,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: CustomerSample | null
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return
    setLoading(true)
    try {
      await customerSampleAPI.delete(data!.id)
      toast.success('删除成功')
      onOpenChange(false)
      setConfirmText('')
      onSuccess()
    } catch (error) {
      toast.error('删除失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除样品 "{data?.样品单号}" 吗？此操作无法恢复。
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-2">
            请输入 <span className="font-bold text-destructive">DELETE</span> 确认删除：
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="输入 DELETE"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setConfirmText('') }}>
            取消
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={confirmText !== 'DELETE' || loading}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Task 11: 创建对话框集合

**Files:**
- Create: `src/features/customer-sample/components/customer-sample-dialogs.tsx`

- [ ] **Step 1: 创建 customer-sample-dialogs.tsx**

```tsx
import { useCustomerSample } from './customer-sample-provider'
import { CustomerSampleFormDialog } from './customer-sample-form-dialog'
import { CustomerSampleDetailDialog } from './customer-sample-detail-dialog'
import { CustomerSampleDeleteDialog } from './customer-sample-delete-dialog'

export function CustomerSampleDialogs({ onRefresh }: { onRefresh: () => void }) {
  const { open, setOpen, currentRow, setCurrentRow, refreshData } = useCustomerSample()

  const handleSuccess = () => {
    refreshData()
    onRefresh()
  }

  return (
    <>
      <CustomerSampleFormDialog
        open={open === 'add'}
        onOpenChange={(o) => !o && setOpen(null)}
        data={null}
        onSuccess={handleSuccess}
        mode="add"
      />
      <CustomerSampleFormDialog
        open={open === 'edit'}
        onOpenChange={(o) => !o && setOpen(null)}
        data={currentRow}
        onSuccess={handleSuccess}
        mode="edit"
      />
      <CustomerSampleDetailDialog
        open={open === 'view'}
        onOpenChange={(o) => !o && setOpen(null)}
        data={currentRow}
      />
      <CustomerSampleDeleteDialog
        open={open === 'delete'}
        onOpenChange={(o) => !o && setOpen(null)}
        data={currentRow}
        onSuccess={handleSuccess}
      />
    </>
  )
}
```

---

## Task 12: 创建表格组件（含展开子表格）

**Files:**
- Create: `src/features/customer-sample/components/customer-sample-table.tsx`

- [ ] **Step 1: 创建 customer-sample-table.tsx**

参考 `dict-type-table.tsx` 的展开行实现，创建支持展开的表格组件。主表格显示简要信息，点击展开后显示完整字段子表格。

---

## Task 13: 创建 PDF 导出组件

**Files:**
- Create: `src/features/customer-sample/components/customer-sample-pdf.tsx`

- [ ] **Step 1: 创建 customer-sample-pdf.tsx**

参考 `ShippingPdfDocument.tsx` 的样式，布局如下：
- 公司标题区
- 客户信息区（客户名称、样品单号、下单日期、需求日期）
- 表格区（规格、产品类型、型号、单位、数量）
- 页脚（制单人、页码）

---

## Task 14: 创建页面入口

**Files:**
- Create: `src/features/customer-sample/index.tsx`

- [ ] **Step 1: 创建 index.tsx**

```tsx
import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { customerSampleAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CustomerSampleProvider, useCustomerSample } from './components/customer-sample-provider'
import { CustomerSampleDialogs } from './components/customer-sample-dialogs'
import { CustomerSampleTable } from './components/customer-sample-table'

function CustomerSampleContent() {
  const { setOpen, setCurrentRow } = useCustomerSample()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const search = useSearch()

  const { globalFilter, onGlobalFilterChange, pagination, onPaginationChange } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true },
  })

  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['customerSamples'] })
    setRefreshKey((k) => k + 1)
  }, [queryClient])

  return (
    <>
      <Header>
        <SearchComponent />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className='flex flex-1 flex-col gap-4'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>客户样品</h2>
            <p className='text-muted-foreground'>管理客户样品订单</p>
          </div>
          <Button onClick={() => { setCurrentRow(null); setOpen('add') }}>
            <Plus data-icon='inline-start' />
            新增
          </Button>
        </div>
        <CustomerSampleTable
          refreshKey={refreshKey}
          onView={(row) => { setCurrentRow(row); setOpen('view') }}
          onEdit={(row) => { setCurrentRow(row); setOpen('edit') }}
          onDelete={(row) => { setCurrentRow(row); setOpen('delete') }}
        />
      </Main>
      <CustomerSampleDialogs onRefresh={handleRefresh} />
    </>
  )
}

export function CustomerSamplePage() {
  return (
    <CustomerSampleProvider>
      <CustomerSampleContent />
    </CustomerSampleProvider>
  )
}
```

---

## Task 15: 创建路由

**Files:**
- Create: `src/routes/_authenticated/customer-sample/index.tsx`

- [ ] **Step 1: 创建路由文件**

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { CustomerSamplePage } from '@/features/customer-sample'

export const Route = createFileRoute('/_authenticated/customer-sample/')({
  component: CustomerSamplePage,
})
```

---

## Task 16: 测试验证

- [ ] **Step 1: 启动后端验证 API**

```bash
cd backend && python -c "from app.api.customer_sample import router; print('API OK')"
```

- [ ] **Step 2: 启动前端验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 手动测试功能**
1. 访问 /customer-sample 页面
2. 测试新增样品
3. 测试编辑样品
4. 测试查看详情
5. 测试删除
6. 测试展开子表格
7. 测试 PDF 导出

---

**Plan complete.** 等待用户确认后开始实现。
