import os
import shutil
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

import repository
from schemas import MessageResponse, MessageUpdate
from dependencies import get_db, get_current_user
from models import User

router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)

# робимо директорію для медіафайлів, якщо її ще немає:
Path("media").mkdir(exist_ok=True)


@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def create_new_message(
    content: str = Form(...),
    receiver_id: int = Form(...),
    files: Optional[List[UploadFile]] = File(default=None), # пустий список файлів, якщо юзер нічого не вкладає
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Створює нове повідомлення з можливістю прикріпити файли.
    """
    # зберігаємо файли на сервері та готуємо дані для запису в БД:
    attachments_data = []
    if files:
        for file in files:
            if not file.filename:
                continue
            # Генеруємо унікальний шлях для файлу (як буде зберігатися на сервері)
            file_path = f"media/{current_user.id}_{file.filename}"
        
            # Зберігаємо файл на сервері:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        
            attachments_data.append({
                    "original_filename": file.filename,
                    "file_path": file_path,
                    "file_type": file.content_type 
                })
        
    # Створюємо повідомлення і записи про файли в базі:
    message = repository.create_message(
        db,
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=content,
        attachments_data=attachments_data
    )
    return message

 
@router.get("/{contact_id}", response_model=List[MessageResponse])
def get_chat_history(contact_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Отримує історію листування з обраним контактом.
    """
    messages = repository.get_messages(db, user1_id=current_user.id, user2_id=contact_id)
    return messages


@router.put("/{message_id}", response_model=MessageResponse)
def update_message(
    message_id: int,
    message_data: MessageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Оновлює текст повідомлення.
    Дозволено оновлювати тільки власні повідомлення.
    """
    message = repository.get_message_by_id(db, message_id)

    # чек 1: Чи існує таке повідомлення?
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Повідомлення не знайдено"
        )
        
    # чек 2: Чи є поточний користувач відправником цього повідомлення?
    if message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ви не можете редагувати чужі повідомлення"
        )
        
    updated_message = repository.update_message_content(
        db, 
        message_id=message_id, 
        new_content=message_data.content
    )
    return updated_message


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Видаляє повідомлення.
    Дозволено видаляти тільки власні повідомлення.
    """
    message = repository.get_message_by_id(db, message_id)

    # перевірка 1: Чи існує таке повідомлення?
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Повідомлення не знайдено"
        )
        
    # перевірка 2: Чи є поточний користувач відправником цього повідомлення?
    if message.sender_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ви не можете видаляти чужі повідомлення"
        )
        
    repository.delete_message(db, message_id)
