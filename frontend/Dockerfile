# 1. Базовий образ
FROM node:20-alpine

# 2. Робоча директорі
WORKDIR /app

# 3. Копіюємо файли-декларації
COPY package.json yarn.lock* ./

# 4. Встановлюємо залежності за допомогою YARN
RUN yarn install --frozen-lockfile

# 5. Копіюємо решту коду
COPY . .

# 6. Відкриваємо порт
EXPOSE 3000

# 7. Запускаємо сервер розробки за допомогою YARN
CMD ["yarn", "dev"]