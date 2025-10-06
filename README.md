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
- run Docker desktop

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
`docker-compose exec [service_name] [command]`:
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
    *   `docker-compose up --build` (дочекайтеся запуску всіх контейнерів)
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
........................................
Зупинити контейнер і видалити всі контейнери і всі волюми:
docker-compose down -v
........................................
Перезібрати Docker-образ і запустити:
docker-compose build --no-cache backend
docker-compose up
........................................

### Шпаргалка: Старий підхід vs Новий Docker-підхід

| Дія | Старий підхід (лише venv) | **Новий Docker-підхід** |
| :--- | :--- | :--- |
| **Додати пакет** | `poetry add <package>` | 1. `poetry add <package>`<br>2. `poetry export ...`<br>3. `docker-compose up --build` |
| **Запустити додаток** | `uvicorn main:app --reload` | `docker-compose up` |
| **Запустити міграцію** | `alembic upgrade head` | `docker-compose exec backend alembic upgrade head` |
| **Зайти в shell** | `python` | `docker-compose exec backend python` (або `bash`) |


Видалити волюм і всі дані:
docker-compose down -v


.............................................................................................
.............................................................................................
.............................................................................................
.............................................................................................


Бекенд vs Фронтенд

| Задача | Світ Бекенду (Python) | Світ Фронтенду (JavaScript/React) |
| :--- | :--- | :--- |
| **Менеджер пакетів** | `pip` | `npm` (або `yarn`) |
| **Файл-декларація** | `requirements.txt` | `package.json` |
| **Папка з пакетами** | `venv/Lib/site-packages` | `node_modules` |
| **Команда встановлення** | `pip install fastapi` | `npm install axios` |

Ваш робочий процес для фронтенду буде дуже схожим на бекенд, просто з іншими інструментами.

#### 1. Локальна розробка

1.  Ви відкриваєте термінал **саме у папці `frontend`**.
2.  Виконуєте команду: `npm install axios react-router-dom`.
3.  `npm` робить дві речі:
    *   **Оновлює `package.json`:** Додає `axios` та `react-router-dom` у секцію `dependencies`. **Це ваш аналог `requirements.txt`!** Цей файл — єдине джерело правди про залежності фронтенду.
    *   **Завантажує пакети:** Створює (або оновлює) папку `node_modules` і складає туди всі необхідні файли. Ця папка величезна і її **завжди** додають у `.gitignore`.

#### 2. Передача в контейнер (через `Dockerfile`)

Ось тут і відбувається магія, аналогічна бекенду. Ваш `Dockerfile` для фронтенду (файл `frontend/Dockerfile`) повинен виконувати наступні кроки:

1.  **Скопіювати файл-декларацію:** Взяти `package.json` (і `package-lock.json` для точного відтворення версій) і скопіювати його в контейнер.
2.  **Встановити залежності:** Виконати `npm install` всередині контейнера. Це створить папку `node_modules` вже всередині образу, на основі `package.json`.
3.  **Скопіювати решту коду:** Скопіювати ваші компоненти, сторінки, стилі (`src`, `public` і т.д.).

**Приклад вашого `frontend/Dockerfile`:**

```dockerfile
# frontend/Dockerfile

# 1. Базовий образ з Node.js
FROM node:18-alpine

# 2. Встановлюємо робочу директорію всередині контейнера
WORKDIR /app

# 3. Копіюємо package.json та package-lock.json
# Цей крок робиться окремо для оптимізації кешування Docker.
# Якщо ці файли не змінились, Docker не буде заново встановлювати всі пакети.
COPY package*.json ./

# 4. Встановлюємо залежності всередині контейнера
RUN npm install

# 5. Копіюємо решту коду вашого додатку
COPY . .

# 6. Вказуємо команду, яка буде запускати ваш React-додаток
# Для Create React App це зазвичай "npm start", але для продакшену
# краще використовувати веб-сервер типу Nginx. Для розробки це ідеально.
CMD ["npm", "start"]
```

### Підсумок

1.  **Ніколи** не змішуйте інструменти Python та JS. Працюйте з `npm` у папці `frontend`.
2.  `package.json` — це ваш "requirements.txt" для фронтенду. Він єдиний потрібен, щоб відтворити всі залежності.
3.  `Dockerfile` для фронтенду копіює `package.json` і виконує `npm install` всередині контейнера, створюючи там свою власну папку `node_modules`.
4.  Docker Compose просто запускає збірку цього `Dockerfile` і запускає отриманий контейнер.





