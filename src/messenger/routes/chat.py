from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List
import sqlalchemy

from messenger.db import async_session
from messenger.models import Chat, ChatMember, User
from messenger.schemas.chat import ChatCreate, ChatRead
from messenger.auth.dependencies import get_current_user
from messenger.database.redis import get_redis


router = APIRouter(prefix="/chats", tags=["chats"])


async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session


@router.post("/", response_model=ChatRead)
async def create_chat(
    chat_create: ChatCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    user_ids = list(set(chat_create.user_ids))
    if current_user in user_ids:
        raise HTTPException(status_code=400, detail="Нельзя добавить себя в список участников - вы добавляетесь автоматически")
    
    if not chat_create.is_group:
        if len(user_ids) != 1:
            raise HTTPException(status_code=400, detail="Личный чат должен быть только между двемя пользователями")
    
        result = await session.execute(
            select(Chat)
            .where(Chat.is_group == False)
            .join(ChatMember)
            .where(ChatMember.user_id.in_([current_user.id, user_ids[0]]))
            .group_by(Chat.id)
            .having(sqlalchemy.func.count(ChatMember.user_id) == 2)
        )
        existing_chat = result.scalar_one_or_none()
        if existing_chat:
            raise HTTPException(status_code=409, detail="Такой личный чат уже существует")
    
    if chat_create.is_group and not chat_create.title:
        raise HTTPException(status_code=400, detail="У группового чата должно быть название")
    
    chat = Chat(is_group=chat_create.is_group, title=chat_create.title)
    session.add(chat)
    await session.flush()

    member_ids = user_ids + [current_user.id]
    members = [ChatMember(user_id=uid, chat_id=chat.id) for uid in member_ids]
    session.add_all(members)

    await session.commit()
    return ChatRead(
        id=chat.id,
        title=chat.title,
        is_group=chat.is_group,
        member_ids=member_ids
    )


@router.get("/", response_model=List[ChatRead])
async def get_user_chats(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(select(User).where(User.id == current_user.id))
    db_user = result.scalar_one()

    result = await session.execute(
        select(Chat)
        .join(ChatMember, Chat.id == ChatMember.chat_id)
        .where(ChatMember.user_id == db_user.id)
    )
    chats = result.scalars().all()

    enriched_chats = []
    for chat in chats:
        result = await session.execute(
            select(ChatMember.user_id)
            .where(ChatMember.chat_id == chat.id)
        )
        member_ids = [row[0] for row in result.all()]

        r = await get_redis()
        online_status = {}
        for user_id in member_ids:
            status = await r.hget(f"user:{user_id}", "status") or "offline"
            online_status[str(user_id)] = status
        
        enriched_chats.append({
            "id": chat.id,
            "title": chat.title,
            "is_group": chat.is_group,
            "member_ids": member_ids,
            "online_status": online_status
        })
    
    return enriched_chats
