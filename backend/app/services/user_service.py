from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import user_repository
from app.services.base_service import BaseService
from app.core.security import verify_password, get_password_hash


class UserService(BaseService[User]):
    """用户 Service"""

    def __init__(self):
        super().__init__(user_repository)

    def get_by_username(self, db: Session, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return self.repository.get_by_username(db, username)

    def authenticate(self, db: Session, username: str, password: str) -> Optional[User]:
        """验证用户登录"""
        user = self.get_by_username(db, username)
        if not user:
            return None
        if not verify_password(password, user.password):
            return None
        return user

    def create(
        self,
        db: Session,
        username: str,
        password: str,
        first_name: str,
        last_name: str,
        email: str = None,
        phone: str = None,
        role: str = "cashier"
    ) -> tuple[Optional[User], Optional[str]]:
        """创建用户"""
        if self.repository.username_exists(db, username):
            return None, "用户名已存在"
        
        password_hash = get_password_hash(password)
        user = self.repository.create_user(
            db, username, password_hash, first_name, last_name,
            email, phone, role
        )
        return user, None

    def search(
        self,
        db: Session,
        search: str = None,
        role: str = None,
        status: str = None,
        page: int = 1,
        page_size: int = 20
    ) -> tuple[List[User], int]:
        """搜索用户"""
        skip = (page - 1) * page_size
        return self.repository.search(db, search, role, status, skip, page_size)

    def reset_password(self, db: Session, user_id: int, new_password: str) -> bool:
        """重置密码"""
        user = self.get(db, user_id)
        if not user:
            return False
        password_hash = get_password_hash(new_password)
        self.repository.update(db, user, {"password": password_hash})
        return True

    def change_password(self, db: Session, user_id: int, old_password: str, new_password: str) -> tuple[bool, str]:
        """修改密码"""
        user = self.get(db, user_id)
        if not user:
            return False, "用户不存在"
        if not verify_password(old_password, user.password):
            return False, "旧密码错误"
        password_hash = get_password_hash(new_password)
        self.repository.update(db, user, {"password": password_hash})
        return True, "密码修改成功"


user_service = UserService()
