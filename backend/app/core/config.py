from pydantic_settings import BaseSettings
from typing import List
import json


class Settings(BaseSettings):
    """应用配置类"""
    
    # 应用信息
    APP_NAME: str = "JNS-Order-System"
    DEBUG: bool = True
    SECRET_KEY: str = "JNS-Admin-System-FastAPI"
    
    # 数据库配置
    DATABASE_URL: str = "mssql+pymssql://@JNS-Server:1433/test?charset=utf8"
    DB_JNS_URL: str = "mssql+pymssql://@JNS-Server:1433/JNS?charset=utf8"
    
    # CORS配置
    CORS_ORIGINS: str = '["http://localhost:3000","http://localhost:3001","http://localhost:5173","http://localhost:5174"]'
    
    # JWT配置
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    ALGORITHM: str = "HS256"
    
    # 超级管理员
    SUPERADMIN: str = "admin"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def get_cors_origins(self) -> List[str]:
        """获取CORS来源列表"""
        try:
            return json.loads(self.CORS_ORIGINS)
        except:
            return ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173"]


# 全局配置实例
settings = Settings()