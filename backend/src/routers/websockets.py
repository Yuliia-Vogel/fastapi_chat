import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session

from dependencies import get_db, get_current_user_from_token
from models import User
from connection_manager import manager
import repository

router = APIRouter(
    tags=["WebSockets"]
)

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    user_id = user.id
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Очікуємо на отримання повідомлення від клієнта
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Зберігаємо повідомлення в базу даних через наш репозиторій
            db_message = repository.create_message(
                db,
                sender_id=user_id,
                receiver_id=message_data['receiver_id'],
                content=message_data['content'],
                attachments_data=[] # Поки що через WebSocket файли не відправляємо
            )
            
            # Готуємо повідомлення для відправки у JSON форматі
            response_message = {
                "id": db_message.id,
                "sender_id": db_message.sender_id,
                "receiver_id": db_message.receiver_id,
                "content": db_message.content,
                "message_date": db_message.message_date.isoformat(),
                "attachments": []
            }

            # Відправляємо повідомлення отримувачу, якщо він онлайн
            await manager.send_personal_message(response_message, message_data['receiver_id'])
            
            # Відправляємо те саме повідомлення назад відправнику (для підтвердження)
            await manager.send_personal_message(response_message, user_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id)
