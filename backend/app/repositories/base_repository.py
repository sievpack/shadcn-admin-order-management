from typing import Generic, TypeVar, Type, Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, date

ModelType = TypeVar("ModelType")


def format_value(value: Any) -> Any:
    """格式化值用于 to_dict"""
    if isinstance(value, datetime):
        return value.strftime('%Y-%m-%d %H:%M:%S')
    elif isinstance(value, date):
        return value.strftime('%Y-%m-%d')
    return value


class BaseRepository(Generic[ModelType]):
    """基础 Repository 类，提供通用的 CRUD 操作"""

    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: int) -> Optional[ModelType]:
        """根据 ID 获取单条记录"""
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """获取多条记录，支持分页"""
        return db.query(self.model).offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: dict) -> ModelType:
        """创建新记录"""
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.flush()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, db_obj: ModelType, obj_in: dict
    ) -> ModelType:
        """更新记录"""
        for field, value in obj_in.items():
            setattr(db_obj, field, value)
        db.flush()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int) -> bool:
        """删除记录"""
        obj = self.get(db, id)
        if obj:
            db.delete(obj)
            return True
        return False

    def exists(self, db: Session, id: int) -> bool:
        """检查记录是否存在"""
        return db.query(self.model).filter(self.model.id == id).first() is not None

    def count(self, db: Session) -> int:
        """获取记录总数"""
        return db.query(self.model).count()

    def to_dict(self, obj: ModelType) -> Dict[str, Any]:
        """将模型对象转换为字典"""
        if obj is None:
            return {}
        result = {}
        for column in obj.__table__.columns:
            value = getattr(obj, column.name)
            result[column.name] = format_value(value)
        return result
