# fastapi_chat
Messenger application for direct chat for 2 registered users. 
FastAPI + React + TypeScript + Postgres. 
Containerized application.



.......................
DVELOPMENT INSTRUCTION
.......................
 - Work in virtual environment:
python -m venv venv
venv/Scripts/Activate.ps1
pip install poetry
- enter folder 'backend' -> 
poetry install --no-root

1. Add new package:
- 
`poetry add alembic sqlalchemy psycopg2-binary`

2. !!! Refresh requirements.txt:
- enter folder 'backend' -> 
`poetry export -f requirements.txt --output requirements.txt --without-hashes`

3. Re-build Docker-image:
- enter the project root folder -> 
`docker-compose up --build`

4. If actions nesessary inside Docker-container:
`docker-compose exec [назва_сервісу] [команда]`:
For example, migration inside container:
```
# Alembic init:
docker-compose exec backend alembic init alembic

# Create new migration:
docker-compose exec backend alembic revision --autogenerate -m "Create users table"

# Apply new migration:
docker-compose exec backend alembic upgrade head
```
......................................................


### Практичний приклад: Налаштування Alembic від А до Я

1.  **Встановлення:**
    *   `poetry add alembic sqlalchemy psycopg2-binary`
    *   `poetry export -f requirements.txt --output requirements.txt --without-hashes`
    <!-- *   `docker-compose up --build` (дочекайтеся запуску всіх контейнерів) -->
    *** якщо треба буде ще щось робитивсередині контейнера, то його запускаємо в фоновому режимі, і тоді можна буде писати команди в терміналі:
    * docker-compose up -d --build
    перевіряємо, чи працюють контейнери в фоновому режимі:
    * docker ps (у відповідь отримую 3 мої контейнери з докер-композа)
    * все, тепер в цьому ж терміналі можна робити ініціалізацію (наступний крок)

2.  **Ініціалізація:**
    *   ```bash
        docker-compose exec backend alembic init alembic
        ```
    *   **Магія `volumes`:** Завдяки тому, що у `docker-compose.yml` у вас прописано `volumes: - ./backend/src:/app`, папка `alembic`, яку команда створила **всередині контейнера**, миттєво з'явиться у вас локально в папці `backend/src`!

3.  **Налаштування Alembic:**
    *   **Відкрийте локально файл `alembic.ini`**. Знайдіть рядок `sqlalchemy.url` і вставте туди URL для підключення до вашої Docker-бази даних. **Важливо:** ім'я хоста має бути `db` (назва сервісу з `docker-compose.yml`), а не `localhost`.
        ```ini
        sqlalchemy.url = postgresql://messenger:messenger_pass@db:5432/messenger_db
        ```
    *   **Відкрийте локально файл `alembic/env.py`**. Вам потрібно сказати Alembic, де знаходяться ваші моделі SQLAlchemy, щоб він міг автоматично генерувати міграції.
        *   Знайдіть рядок `target_metadata = None`.
        *   Імпортуйте ваші моделі (наприклад, з `models.py`) та їх базовий клас `Base`.
        *   Замініть `target_metadata = None` на `target_metadata = Base.metadata`.

4.  **Створення та застосування міграцій:**
    *   Створіть ваші класи моделей у `models.py`.
    *   Створіть першу міграцію:
        ```bash
        docker-compose exec backend alembic revision --autogenerate -m "Initial migration with users table"
        ```
    *   Застосуйте її до бази даних:
        ```bash
        docker-compose exec backend alembic upgrade head
        ```

### Шпаргалка: Старий підхід vs Новий Docker-підхід

| Дія | Старий підхід (лише venv) | **Новий Docker-підхід** |
| :--- | :--- | :--- |
| **Додати пакет** | `poetry add <package>` | 1. `poetry add <package>`<br>2. `poetry export ...`<br>3. `docker-compose up --build` |
| **Запустити додаток** | `uvicorn main:app --reload` | `docker-compose up` |
| **Запустити міграцію** | `alembic upgrade head` | `docker-compose exec backend alembic upgrade head` |
| **Зайти в shell** | `python` | `docker-compose exec backend python` (або `bash`) |
