from typing import Optional, List, Tuple
from sqlalchemy.orm import Session

from app.models.dict import DictType, DictData
from app.repositories.dict_repository import dict_type_repository, dict_data_repository
from app.services.base_service import BaseService


class DictTypeService(BaseService[DictType]):
    """字典类型 Service"""

    def __init__(self):
        super().__init__(dict_type_repository)

    def search(
        self,
        db: Session,
        search: str = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[DictType], int]:
        """搜索字典类型"""
        skip = (page - 1) * page_size
        return self.repository.search(db, search, skip, page_size)

    def get_all_available(self, db: Session) -> List[DictType]:
        """获取所有可用的字典类型"""
        return self.repository.get_all_available(db)

    def get_by_type(self, db: Session, dict_type: str) -> Optional[DictType]:
        """根据类型获取字典类型"""
        return self.repository.get_by_type(db, dict_type)

    def create(
        self,
        db: Session,
        dict_name: str,
        dict_type: str,
        description: str = None,
        available: bool = True,
        creator_id: int = None
    ) -> Tuple[Optional[DictType], Optional[str]]:
        """创建字典类型"""
        if self.repository.type_exists(db, dict_type):
            return None, "字典类型已存在"

        dict_type_obj = self.repository.create(db, {
            "dict_name": dict_name,
            "dict_type": dict_type,
            "description": description,
            "available": available,
            "creator_id": creator_id
        })
        return dict_type_obj, None

    def update_dict_type(
        self,
        db: Session,
        type_id: int,
        dict_name: str = None,
        dict_type: str = None,
        description: str = None,
        available: bool = None
    ) -> Tuple[Optional[DictType], Optional[str]]:
        """更新字典类型"""
        dict_type_obj = self.get(db, type_id)
        if not dict_type_obj:
            return None, "字典类型不存在"

        if dict_type and dict_type != dict_type_obj.dict_type:
            if self.repository.type_exists(db, dict_type, exclude_id=type_id):
                return None, "字典类型已存在"

        update_data = {}
        if dict_name is not None:
            update_data["dict_name"] = dict_name
        if dict_type is not None:
            update_data["dict_type"] = dict_type
        if description is not None:
            update_data["description"] = description
        if available is not None:
            update_data["available"] = available

        if update_data:
            self.repository.update(db, dict_type_obj, update_data)
        return dict_type_obj, None

    def delete_type(self, db: Session, type_id: int) -> Tuple[bool, Optional[str]]:
        """删除字典类型"""
        dict_type_obj = self.get(db, type_id)
        if not dict_type_obj:
            return False, "字典类型不存在"

        dict_data_repository.delete_by_type(db, dict_type_obj.dict_type)
        self.repository.delete(db, type_id)
        return True, None


class DictDataService(BaseService[DictData]):
    """字典数据 Service"""

    def __init__(self):
        super().__init__(dict_data_repository)

    def search(
        self,
        db: Session,
        dict_type: str = None,
        search: str = None,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[DictData], int]:
        """搜索字典数据"""
        skip = (page - 1) * page_size
        return self.repository.search(db, dict_type, search, skip, page_size)

    def get_by_type(self, db: Session, dict_type: str) -> List[DictData]:
        """根据类型获取字典数据"""
        return self.repository.get_by_type(db, dict_type)

    def create(
        self,
        db: Session,
        dict_label: str,
        dict_value: str,
        dict_type: str,
        dict_sort: int = 0,
        css_class: str = None,
        list_class: str = None,
        is_default: bool = False,
        description: str = None,
        available: bool = True,
        creator_id: int = None
    ) -> DictData:
        """创建字典数据"""
        return self.repository.create(db, {
            "dict_label": dict_label,
            "dict_value": dict_value,
            "dict_type": dict_type,
            "dict_sort": dict_sort,
            "css_class": css_class,
            "list_class": list_class,
            "is_default": is_default,
            "description": description,
            "available": available,
            "creator_id": creator_id
        })

    def update_dict_data(
        self,
        db: Session,
        data_id: int,
        dict_label: str = None,
        dict_value: str = None,
        dict_type: str = None,
        dict_sort: int = None,
        css_class: str = None,
        list_class: str = None,
        is_default: bool = None,
        description: str = None,
        available: bool = None
    ) -> Tuple[Optional[DictData], Optional[str]]:
        """更新字典数据"""
        dict_data_obj = self.get(db, data_id)
        if not dict_data_obj:
            return None, "字典数据不存在"

        update_data = {}
        if dict_label is not None:
            update_data["dict_label"] = dict_label
        if dict_value is not None:
            update_data["dict_value"] = dict_value
        if dict_type is not None:
            update_data["dict_type"] = dict_type
        if dict_sort is not None:
            update_data["dict_sort"] = dict_sort
        if css_class is not None:
            update_data["css_class"] = css_class
        if list_class is not None:
            update_data["list_class"] = list_class
        if is_default is not None:
            update_data["is_default"] = is_default
        if description is not None:
            update_data["description"] = description
        if available is not None:
            update_data["available"] = available

        if update_data:
            self.repository.update(db, dict_data_obj, update_data)
        return dict_data_obj, None


dict_type_service = DictTypeService()
dict_data_service = DictDataService()