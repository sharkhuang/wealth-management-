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
    s3_key: str
    created_at: datetime
    updated_at: datetime
    url: Optional[str] = None

    class Config:
        from_attributes = True 