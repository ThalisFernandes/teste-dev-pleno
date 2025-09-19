# aq a gnt configura o container do backend
FROM node:18-alpine

WORKDIR /app

# copia os arquivos de dependencias
COPY package*.json ./

# instala as dependencias
RUN npm ci

# copia o resto dos arquivos
COPY . .

# gera o cliente do prisma
RUN npx prisma generate

# expoe a porta
EXPOSE 5000

# comando pra rodar em dev
CMD ["npm", "run", "dev"]