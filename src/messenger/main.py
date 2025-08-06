from fastapi import FastAPI, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from messenger.db import init_db, async_session
from messenger import models
from messenger.routes import auth, chat as chat_routes, messages
from messenger.utils.ws_manager import manager
from messenger.auth.dependencies import get_current_user_ws


app = FastAPI(
    title="Messenger API",
    description="Простой мессенджер",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # allow_websocket_connections=["http://localhost:3000"],
)

app.include_router(auth.router)
app.include_router(chat_routes.router)
app.include_router(messages.router)


@app.on_event("startup")
async def on_startup():
    await init_db()
    asyncio.create_task(manager.listen_pubsub(1))


@app.websocket("/ws/chat/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: int):
    user = None
    try:
        await websocket.accept()
        user = await get_current_user_ws(websocket)
        user_id = str(user.id)

        await manager.connect(chat_id, websocket, user_id)

        while True:
            data = await websocket.receive_json()
            content = data.get("content")

            if content:
                async with async_session() as session:
                    msg = models.Message(
                        content=content,
                        sender_id=user.id,
                        chat_id=chat_id
                    )
                    session.add(msg)
                    await session.commit()
                    await session.refresh(msg)

                    message_data = {
                        "id": msg.id,
                        "content": msg.content,
                        "created_at": msg.created_at.isoformat(),
                        "sender_id": str(msg.sender_id),
                        "chat_id": msg.chat_id
                    }

                    await manager.broadcast(chat_id, message_data)

    except WebSocketDisconnect as e:
        print(f"WebSocket disconnected: {e.code} - {e.reason}")
        if user:
            await manager.disconnect(chat_id, websocket, user.id)
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR, reason=str(e))
