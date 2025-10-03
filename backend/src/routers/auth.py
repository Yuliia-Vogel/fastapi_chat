from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from schemas import UserResponse, UserCreate
from repository import get_user_by_email, create_user
from dependencies import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Перевірка, чи не існує вже користувач з таким email
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Користувач з таким email вже зареєстрований"
        )
    
    # Створюємо нового користувача
    new_user = create_user(db=db, user=user)
    return new_user
