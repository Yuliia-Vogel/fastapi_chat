from sqlalchemy.orm import Session
from typing import List

from models import User, Message, Attachment
from schemas import UserCreate, UserResponse
from security import get_password_hash

# --- функції для юзерів ---

def create_user(db: Session, user: UserCreate):
      # --- ДЕБАГ ---
    print(f"DEBUG: Що ми хешуємо? Тип: {type(user.password)}")
    print(f"DEBUG: Значення: '{user.password}'")
    print(f"DEBUG: Довжина: {len(user.password)}")
    # -------------
    hashed_password = get_password_hash(user.password)
    # hashed_password = f"hashed_{user.password}" # Тимчасова заглушка!
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password #  хешований пароль
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session, current_user_id: int):
    # повертає всіх користувачів, окрім того, хто робить запит
    return db.query(User).filter(User.id != current_user_id).all()


# --- функції для повідомлень ---

def create_message(db: Session, sender_id: int, receiver_id: int, content: str, attachments_data: List[dict]):
    # Створюємо об'єкт повідомлення
    db_message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=content
    )
    db.add(db_message)
    db.flush() # Використовуємо flush, щоб отримати айдішнік повідомлення до коміту

    # створюємо об'єкти вкладень, пов'язані з цим повідомленням
    for attachment_data in attachments_data:
        db_attachment = Attachment(
            message_id=db_message.id,
            original_filename=attachment_data["original_filename"],
            file_path=attachment_data["file_path"]
        )
        db.add(db_attachment)
        
    db.commit()
    db.refresh(db_message)
    return db_message


def get_messages(db: Session, user1_id: int, user2_id: int):
    # знаходимо всі повідомлення між конкретними двома користувачами
    messages = db.query(Message).filter(
        ((Message.sender_id == user1_id) & (Message.receiver_id == user2_id)) |
        ((Message.sender_id == user2_id) & (Message.receiver_id == user1_id))
    ).order_by(Message.message_date.asc()).all()
    return messages


def get_message_by_id(db: Session, message_id: int):
    """Знаходить повідомлення за його id."""
    return db.query(Message).filter(Message.id == message_id).first()


def update_message_content(db: Session, message_id: int, new_content: str):
    """Оновлює текст вже відправленого повідомлення."""
    db_message = get_message_by_id(db, message_id)
    if db_message:
        db_message.content = new_content
        db.commit()
        db.refresh(db_message)
    return db_message


def delete_message(db: Session, message_id: int):
    """Видаляє повідомлення з бази даних."""
    db_message = get_message_by_id(db, message_id)
    if db_message:
        db.delete(db_message)
        db.commit()
    return db_message 