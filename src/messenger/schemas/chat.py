from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID


class ChatCreate(BaseModel):
    is_group: bool
    title: Optional[str] = None
    user_ids: List[UUID]


class ChatRead(BaseModel):
    id: int
    title: Optional[str]
    is_group: bool
    member_ids: List[UUID]
