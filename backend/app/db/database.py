from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# 创建数据库引擎
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

# 创建JNS数据库引擎
engine_jns = create_engine(
    settings.DB_JNS_URL,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
SessionLocalJNS = sessionmaker(autocommit=False, autoflush=False, bind=engine_jns)

# 声明基类
Base = declarative_base()

# 配置多数据库绑定
class SQLAlchemyBind:
    """数据库绑定类"""
    def __init__(self):
        self.binds = {
            'DB_JNS': engine_jns
        }

# 全局绑定实例
db_binds = SQLAlchemyBind()


def get_db() -> Session:
    """获取主数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_jns() -> Session:
    """获取JNS数据库会话"""
    db = SessionLocalJNS()
    try:
        yield db
    finally:
        db.close()