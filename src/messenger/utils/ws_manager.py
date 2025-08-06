from typing import Dict, List
from fastapi import WebSocket
from collections import defaultdict
import redis.asyncio as redis
import json
from uuid import UUID

from messenger.models import User
from messenger.database.redis import get_redis


class ConnectionManager:
    def __init__(self):
        self.active_connections = defaultdict(dict)
    
    async def connect(self, chat_id: int, websocket: WebSocket, user_id: UUID):
        # await websocket.accept()
        self.active_connections[chat_id][id(websocket)] = websocket

        r = await get_redis()
        await r.sadd(f"chat:{chat_id}:users", user_id)
        await r.hset(f"user:{user_id}", mapping={
            "status": "online",
            "last_seen": "" 
        })
    
    async def disconnect(self, chat_id: int, websocket: WebSocket, user_id: UUID):
        if id(websocket) in self.active_connections[chat_id]:
            del self.active_connections[chat_id][id(websocket)]

            # r = await get_redis()
            # await r.srem(f"chat:{chat_id}:users", user_id)

            # if not any(user_id in connections for connections in self.active_connections.values()):
            #     await r.hset(f"user:{user_id}", "status", "offline")
    
    async def broadcast(self, chat_id: int, message: dict):
        if chat_id in self.active_connections:
            for ws in self.active_connections[chat_id].values():
                try:
                    await ws.send_json(message)
                except:
                    await self.disconnect(chat_id, ws, None)
        # r = await get_redis()
        # await r.publish(f"chat:{chat_id}", json.dumps(message))
    
    async def listen_pubsub(self, chat_id: int):
        r = await get_redis()
        pubsub = r.pubsub()
        await pubsub.subscribe(f"chat:{chat_id}")

        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                for ws in self.active_connections[chat_id].values():
                    await ws.send_json(data)

manager = ConnectionManager()