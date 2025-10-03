from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate, UserResponse
# Тут буде функція для хешування паролю, яку створю далі
# from .auth_utils import hash_password 

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    # Уявімо, що у нас є функція hash_password
    hashed_password = f"hashed_{user.password}" # Тимчасова заглушка!
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password #  хешований пароль
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user