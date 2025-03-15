from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NetWorthEntryBase(BaseModel):
    value: float
    date: datetime

class NetWorthEntryCreate(NetWorthEntryBase):
    pass

class NetWorthEntry(NetWorthEntryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    name: str
    type: str
    size: int

class DocumentCreate(DocumentBase):
    s3_key: str

class Document(DocumentBase):
    id: int
    name: str
    type: str
    size: int
    s3_key: str
    url: Optional[str] = None
    created_at: datetime
    analysis_status: str
    analysis_result: Optional[str] = None

    class Config:
        from_attributes = True 