from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate, UserResponse
from security import get_password_hash


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


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