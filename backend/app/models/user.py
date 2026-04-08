import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.db.database import Base


class User(Base):
    """用户表"""
    __tablename__ = 'Users'
    __bind_key__ = 'DB_JNS'

    id = Column(Integer, primary_key=True, comment="用户ID")
    username = Column(String(50), unique=True, nullable=False, comment="用户名")
    password = Column(String(255), nullable=False, comment="密码")
    first_name = Column(String(50), nullable=False, comment="名")
    last_name = Column(String(50), nullable=False, comment="姓")
    email = Column(String(100), comment="邮箱")
    phone = Column(String(20), comment="手机")
    role = Column(String(20), default='cashier', comment="角色")
    status = Column(String(20), default='active', comment="状态")
    created_at = Column(DateTime, default=datetime.datetime.now, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now, comment="更新时间")