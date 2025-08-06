from fastapi import Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from messenger.auth.security import SECRET_KEY, ALGORITHM
from messenger.models import User
from messenger.db import async_session


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_session)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить токен",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    return user


async def get_current_user_ws(websocket: WebSocket) -> User:
    token = websocket.query_params.get("token")

    if not token:
        # await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Token missing")
        raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION)
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if not user_id:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid token payload")
            raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION)
        user_id_str = str(user_id)
    
    except (JWTError, TypeError, ValueError) as e:
        print(f"WebSocket auth error: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Token verification failed")
        raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION)

    async with async_session() as session:
        result = await session.execute(select(User).where(User.id == user_id_str))
        user = result.scalar_one_or_none()

        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="User not found")
            raise WebSocketDisconnect(code=status.WS_1008_POLICY_VIOLATION)

        return user