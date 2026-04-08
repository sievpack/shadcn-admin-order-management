import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from app.db.database import Base


class DictType(Base):
    """字典类型表"""
    __tablename__ = 'dict_type'
    __bind_key__ = 'DB_JNS'

    id = Column(Integer, primary_key=True, comment="字典类型ID")
    dict_name = Column(String(100), comment="字典名称")
    dict_type = Column(String(100), unique=True, nullable=False, comment="字典类型")
    available = Column(Boolean, default=True, comment="是否可用")
    description = Column(Text, nullable=True, comment="描述")
    created_at = Column(DateTime, default=datetime.datetime.now, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now, comment="更新时间")
    creator_id = Column(Integer, nullable=True, comment="创建者ID")


class DictData(Base):
    """字典数据表"""
    __tablename__ = 'dict_data'
    __bind_key__ = 'DB_JNS'

    id = Column(Integer, primary_key=True, comment="字典数据ID")
    dict_sort = Column(Integer, default=0, comment="排序")
    dict_label = Column(String(100), nullable=False, comment="字典标签")
    dict_value = Column(String(100), nullable=False, comment="字典值")
    dict_type = Column(String(100), nullable=False, comment="字典类型")
    css_class = Column(String(100), nullable=True, comment="CSS样式类")
    list_class = Column(String(100), nullable=True, comment="列表样式类")
    is_default = Column(Boolean, default=False, comment="是否默认")
    available = Column(Boolean, default=True, comment="是否可用")
    description = Column(Text, nullable=True, comment="描述")
    created_at = Column(DateTime, default=datetime.datetime.now, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.datetime.now, onupdate=datetime.datetime.now, comment="更新时间")
    creator_id = Column(Integer, nullable=True, comment="创建者ID")