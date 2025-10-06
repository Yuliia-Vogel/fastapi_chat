from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# --- cхеми для USER ---

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str = Field(min_length=8, max_length=72)

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str # важливо - не повинно бути пароля!
    user_creation_date: datetime

    class Config:
        from_attributes = True

# --- cхеми для токену ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None