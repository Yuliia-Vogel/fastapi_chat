import os
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()

database_url = os.getenv("DATABASE_URL")

# Перевірка наявності даних для підключення
if not database_url:
    raise ValueError("Не знайдено DATABASE_URL у змінних середовища")

engine = create_engine(database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
        print("Database connected")
    finally:
        db.close()