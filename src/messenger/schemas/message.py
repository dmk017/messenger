from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class MessageCreate(BaseModel):
    chat_id: int
    content: Optional[str]


class MessageRead(BaseModel):
    id: int
    content: Optional[str]
    created_at: datetime
    sender_id: UUID
    chat_id: int

    class Config:
        orm_mode= True