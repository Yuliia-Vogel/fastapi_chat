# Беру образ Python
FROM python:3.9-slim

# Встановлюю правильну змінну PATH, щоб система бачила пакети, встановлені pip
ENV PATH="/root/.local/bin:${PATH}"

# Встановлюю робочу директорію (в докер-контейнері) для ВСЬОГО, що стосується додатку
WORKDIR /app

# копіюю файл із залежностями в папку app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копіюю код з локальної папки src в папку app в контейнері
COPY ./src .

# Тепер ця команда виконується з app і легко знаходить main.py
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]