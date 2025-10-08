from fastapi import FastAPI
from routers import auth, users, messages, websockets
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles


app = FastAPI(
    title="1+1",
    description="API for direct messaging between 2 authorized users",
    version="1.0",
    swagger_ui_parameters={"persistAuthorization": True},  # Запам'ятовує авторизацію
)


origins = [
    "http://localhost",
    "http://localhost:3000", # реакт
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"], # Дозволити всі методи (GET, POST, etc.)
    allow_headers=["*"], # Дозволити всі заголовки
)

app.mount("/media", StaticFiles(directory="media"), name="media") # це для того, щоб бекенд роздавав файли з папки "медіа"

@app.get("/")
async def root():
    return {"message": "Welcome to the first page"}


@app.get("/api/v1/healthchecker")
async def health_check():
    return {"message": "This is Healthchecker 1 message. It's Ok!"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(messages.router)
app.include_router(websockets.router)