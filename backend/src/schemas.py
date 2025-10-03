from pydantic import BaseModel, EmailStr
from datetime import datetime

# --- cхеми для USER ---

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str # важливо - не повинно бути пароля!
    user_creation_date: datetime

    class Config:
        from_attributes = True
