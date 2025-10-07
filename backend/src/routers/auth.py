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



@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.refresh_token = None
    db.commit()
    return {"message": "Ви успішно вийшли з акаунту."}


# Логаут планую зробити тз "клієнтським", тобто токен живе вказані 30 хв (у localStorage) і потім деактивується сам. 
# Тобто окремого роута для логаута не буде. Але на фронті зроблю кнопку "Вийти", натиснувши яку користувач 
# виходить з фронтенду (тобто він на фронті видалить токен з localStorage), і таким чином сесія цього токена/користувача завершиться.