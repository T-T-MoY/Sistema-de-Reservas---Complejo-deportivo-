FROM node:22-alpine
WORKDIR /app

# Copia tanto el package.json como el package-lock.json real
COPY package.json package-lock.json ./

# Instala de forma limpia con las versiones exactas
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]