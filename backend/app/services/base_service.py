from typing import Generic, TypeVar, Optional, List
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository

ModelType = TypeVar("ModelType")
RepositoryType = TypeVar("RepositoryType", bound=BaseRepository)


class BaseService(Generic[ModelType]):
    """基础 Service 类，提供通用的业务逻辑"""

    def __init__(self, repository: BaseRepository):
        self.repository = repository

    def get(self, db: Session, id: int) -> Optional[ModelType]:
        """获取单条记录"""
        return self.repository.get(db, id)

    def get_multi(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """获取多条记录"""
        return self.repository.get_multi(db, skip, limit)

    def create(self, db: Session, obj_in: dict) -> ModelType:
        """创建新记录"""
        return self.repository.create(db, obj_in)

    def update(self, db: Session, id: int, obj_in: dict) -> Optional[ModelType]:
        """更新记录"""
        obj = self.repository.get(db, id)
        if not obj:
            return None
        return self.repository.update(db, obj, obj_in)

    def delete(self, db: Session, id: int) -> bool:
        """删除记录"""
        return self.repository.delete(db, id)

    def exists(self, db: Session, id: int) -> bool:
        """检查记录是否存在"""
        return self.repository.exists(db, id)

    def count(self, db: Session) -> int:
        """获取记录总数"""
        return self.repository.count(db)
