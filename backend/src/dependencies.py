from fastapi import Depends, HTTPException, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer

from schemas import TokenData
from security import SECRET_KEY, ALGORITHM 
from repository import get_user_by_email
from database import get_db


# oauth2_scheme - це об'єкт, який буде витягувати токен із запиту, 
# а tokenUrl вказує на віднсний урл ендпоінту, який і видає нам токени
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не вдалося перевірити облікові дані",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # декодую токен
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    # Отримуємо користувача з бази даних
    user = get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user