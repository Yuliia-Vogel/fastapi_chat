import os
import shutil
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

import repository
from schemas import MessageResponse
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


