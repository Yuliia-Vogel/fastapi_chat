from fastapi import WebSocket
from typing import Dict

class ConnectionManager:
    def __init__(self):
        # словничок для зберігання активних з'єднань: {user_id: WebSocket}
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_json(message)

# Створюємо єдиний екземпляр менеджера, який буде використовуватися всім додатком
manager = ConnectionManager()