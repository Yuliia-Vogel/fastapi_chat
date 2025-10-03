from fastapi import FastAPI
# from .routers import auth, messages


app = FastAPI(
    title="1+1",
    description="API for direct messaging between 2 authorized users",
    version="1.0",
    swagger_ui_parameters={"persistAuthorization": True},  # Запам'ятовує авторизацію
)


@app.get("/")
async def root():
    return {"message": "Welcome to the first page"}


@app.get("/healthchecker/1")
async def health1():
    return {"message": "This is Healthchecker 1 message. It's Ok!"}
# app.include_router(auth.router)
# app.include_router(messages.router)