from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
# імпорт спеціального класу для отримання даних з форми:
from fastapi.security import OAuth2PasswordRequestForm

from schemas import UserResponse, UserCreate, Token
from security import verify_password, create_access_token
from repository import get_user_by_email, create_user
from database import get_db
from dependencies import get_current_user, oauth2_scheme
from models import User

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



@router.post("/login", response_model=Token)
def login_for_access_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    # form_data міститиме `username` та `password`.
    # OAuth2 вимагає поле `username`, тому використовую email в якості username:
    user = get_user_by_email(db, email=form_data.username)

    # перевіряю, чи існує користувач і чи правильний пароль
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неправильний email або пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Створюємо JWT токен
    access_token = create_access_token(
        data={"sub": user.email}
    )

    # Повертаємо токен
    return {"access_token": access_token, "token_type": "bearer"}


# тестовий
@router.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    # Завдяки Depends(get_current_user) цей ендпоінт:
    # 1. Вимагатиме Authorization: Bearer <token> заголовок.
    # 2. Якщо токен невалідний або відсутній, поверне помилку 401.
    # 3. Якщо все добре, в `current_user` буде об'єкт користувача з бази даних.
    return current_user