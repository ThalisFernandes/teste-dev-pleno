# aq a gnt configura o container do frontend
FROM node:18-alpine

WORKDIR /app

# copia os arquivos de dependencias
COPY package*.json ./

# instala as dependencias
RUN npm ci

# copia o resto dos arquivos
COPY . .

# expoe a porta
EXPOSE 3000

# comando pra rodar em dev
CMD ["npm", "run", "dev", "--", "--host"]