from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
import uuid


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    username: str = Field(index=True, nullable=False, unique=True)
    email: str = Field(index=True, nullable=False, unique=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    messages_sent: list["Message"] = Relationship(back_populates="sender")
    chats: list["ChatMember"] = Relationship(back_populates="user")


class Chat(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: Optional[str]
    is_group: bool = False

    messages: list["Message"] = Relationship(back_populates="chat")

    members: list["ChatMember"] = Relationship(back_populates="chat")


class ChatMember(SQLModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="users.id", primary_key=True)
    chat_id: int = Field(foreign_key="chat.id", primary_key=True)

    user: "User" = Relationship(back_populates="chats")
    chat: "Chat" = Relationship(back_populates="members")


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    sender_id: uuid.UUID = Field(foreign_key="users.id")
    chat_id: int = Field(foreign_key="chat.id")

    sender: Optional["User"] = Relationship(back_populates="messages_sent")
    chat: Optional["Chat"] = Relationship(back_populates="messages")