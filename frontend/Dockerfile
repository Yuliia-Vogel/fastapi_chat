# 1. Базовий образ
FROM node:20-alpine

# 2. Робоча директорія в контейнері
WORKDIR /app

# 3. Копіюємо ТІЛЬКИ файли-декларації
COPY package.json yarn.lock* ./

# 4. Встановлюємо залежності
RUN yarn install --frozen-lockfile

# 5. Відкриваємо порт
EXPOSE 3000

# 6. Запускаємо сервер розробки
CMD ["yarn", "dev"]