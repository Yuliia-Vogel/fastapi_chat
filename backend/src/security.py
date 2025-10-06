import os
from datetime import datetime, timedelta
from typing import Optional
from dotenv import load_dotenv

from jose import JWTError, jwt
from passlib.context import CryptContext

load_dotenv()

# для хешування паролів
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Секретний ключ для підпису JWT токенів.
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"DB url = {DATABASE_URL}")
SECRET_KEY = os.getenv("MY_SECRET_KEY")
print(f"Secret key = {SECRET_KEY}")
ALGORITHM = os.getenv("ALGORITHM")
print(f"Algorhitm = {ALGORITHM}")
# DATABASE_URL = "postgresql://messenger:messenger_pass@db:5432/messenger_db"
# SECRET_KEY = "my-super-secret-key"
# ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30


def verify_password(password: str, hashed_pass: str) -> bool:
    """Перевіряє, чи співпадає пароль з хешем."""
    return pwd_context.verify(password, hashed_pass)


def get_password_hash(password: str) -> str:
    """Створює хеш пароля."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Створює JWT токен для доступу."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # За замовчуванням токен живе 30 хвилин
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
