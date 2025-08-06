from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import joinedload

from messenger.models import Message, Chat, User
from messenger.schemas.message import MessageCreate, MessageRead
from messenger.auth.dependencies import get_current_user
from messenger.db import async_session


router = APIRouter(prefix="/messages", tags=["messages"])


async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session


@router.post("/", response_model=MessageRead)
async def send_message(
    message_data: MessageCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(
        select(Chat)
        .options(joinedload(Chat.members))
        .where(Chat.id == message_data.chat_id)
    )
    chat = result.scalars().first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Чат не найден")
    
    if current_user.id not in [user.user_id for user in chat.members]:
        raise HTTPException(status_code=403, detail="Вы не состоите в этом чате")

    message = Message(
        content=message_data.content,
        sender_id=current_user.id,
        chat_id=message_data.chat_id,
    )
    session.add(message)
    await session.commit()
    await session.refresh(message)
    return message


@router.get("/chat/{chat_id}", response_model=list[MessageRead])
async def get_chat_message(
    chat_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    result = await session.execute(
        select(Chat)
        .options(joinedload(Chat.members))
        .where(Chat.id == chat_id)
    )
    chat = result.scalars().first()

    if not chat:
        raise HTTPException(status_code=404, detail="Чат не найден")
    
    if current_user.id not in [user.user_id for user in chat.members]:
        raise HTTPException(status_code=403, detail="Вы не состоите в этом чате")

    result = await session.execute(
        select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at)
    )
    return result.scalars().all()