from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    """用户 Repository"""

    def get_by_username(self, db: Session, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return db.query(User).filter(User.username == username).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """根据邮箱获取用户"""
        return db.query(User).filter(User.email == email).first()

    def search(
        self,
        db: Session,
        search: str = None,
        role: str = None,
        status: str = None,
        skip: int = 0,
        limit: int = 20
    ) -> tuple[List[User], int]:
        """搜索用户"""
        query = db.query(User)

        filters = []
        if search:
            search_pattern = f"%{search}%"
            filters.append(
                or_(
                    User.username.contains(search),
                    User.first_name.contains(search),
                    User.last_name.contains(search),
                    User.email.contains(search)
                )
            )
        if role:
            filters.append(User.role == role)
        if status:
            filters.append(User.status == status)

        if filters:
            query = query.filter(*filters)

        total = query.count()
        items = query.order_by(desc(User.id)).offset(skip).limit(limit).all()

        return items, total

    def create_user(
        self,
        db: Session,
        username: str,
        password_hash: str,
        first_name: str,
        last_name: str,
        email: str = None,
        phone: str = None,
        role: str = "cashier"
    ) -> User:
        """创建用户"""
        user = User(
            username=username,
            password=password_hash,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            role=role,
            status='active'
        )
        db.add(user)
        db.flush()
        db.refresh(user)
        return user

    def username_exists(self, db: Session, username: str) -> bool:
        """检查用户名是否存在"""
        return db.query(User).filter(User.username == username).first() is not None


user_repository = UserRepository(User)
