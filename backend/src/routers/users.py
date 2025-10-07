from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

import repository
from schemas import UserResponse
from dependencies import get_db, get_current_user
from models import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Отримує список всіх користувачів, окрім поточного.
    """
    users = repository.get_users(db, current_user_id=current_user.id)
    return users


# тестовий
@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    # Завдяки Depends(get_current_user) цей ендпоінт:
    # 1. Вимагатиме Authorization: Bearer <token> заголовок.
    # 2. Якщо токен невалідний або відсутній, поверне помилку 401.
    # 3. Якщо все добре, в `current_user` буде об'єкт користувача з бази даних.
    return current_user