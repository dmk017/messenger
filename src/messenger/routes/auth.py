from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from messenger.db import async_session
from messenger.models import User
from messenger.schemas.user import UserCreate, UserRead
from messenger.auth.security import hash_password, verify_password, create_access_token
from messenger.auth.dependencies import get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])


async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session


@router.post("/register", response_model=UserRead)
async def register(user_create: UserCreate, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(User).where((User.username == user_create.username) | (User.email == user_create.email))
    )
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким email или username уже существует")
    
    user = User(
        username=user_create.username,
        email=user_create.email,
        password_hash=hash_password(user_create.password)
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@router.post("/login")
async def login(user_create: UserCreate, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User).where(User.username == user_create.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(user_create.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user