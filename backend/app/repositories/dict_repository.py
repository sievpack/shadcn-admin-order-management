from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.dict import DictType, DictData
from app.repositories.base_repository import BaseRepository


class DictTypeRepository(BaseRepository[DictType]):
    """字典类型 Repository"""

    def search(
        self,
        db: Session,
        search: str = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[DictType], int]:
        """搜索字典类型"""
        query = db.query(DictType)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    DictType.dict_name.contains(search),
                    DictType.dict_type.contains(search)
                )
            )

        total = query.count()
        items = query.order_by(DictType.id.desc()).offset(skip).limit(limit).all()
        return items, total

    def get_all_available(self, db: Session) -> List[DictType]:
        """获取所有可用的字典类型"""
        return db.query(DictType).filter(
            DictType.available == True
        ).order_by(DictType.id).all()

    def get_by_type(self, db: Session, dict_type: str) -> Optional[DictType]:
        """根据类型获取字典类型"""
        return db.query(DictType).filter(DictType.dict_type == dict_type).first()

    def type_exists(self, db: Session, dict_type: str, exclude_id: int = None) -> bool:
        """检查类型是否存在"""
        query = db.query(DictType).filter(DictType.dict_type == dict_type)
        if exclude_id:
            query = query.filter(DictType.id != exclude_id)
        return query.first() is not None


class DictDataRepository(BaseRepository[DictData]):
    """字典数据 Repository"""

    def search(
        self,
        db: Session,
        dict_type: str = None,
        search: str = None,
        skip: int = 0,
        limit: int = 20
    ) -> Tuple[List[DictData], int]:
        """搜索字典数据"""
        query = db.query(DictData)

        if dict_type:
            query = query.filter(DictData.dict_type == dict_type)

        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    DictData.dict_label.contains(search),
                    DictData.dict_value.contains(search)
                )
            )

        total = query.count()
        items = query.order_by(DictData.dict_sort, DictData.id.desc()).offset(skip).limit(limit).all()
        return items, total

    def get_by_type(self, db: Session, dict_type: str) -> List[DictData]:
        """根据类型获取字典数据"""
        return db.query(DictData).filter(
            DictData.dict_type == dict_type,
            DictData.available == True
        ).order_by(DictData.dict_sort).all()

    def delete_by_type(self, db: Session, dict_type: str) -> int:
        """根据类型删除字典数据"""
        return db.query(DictData).filter(DictData.dict_type == dict_type).delete()


dict_type_repository = DictTypeRepository(DictType)
dict_data_repository = DictDataRepository(DictData)