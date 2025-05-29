FROM node:23-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY *.ts ./

CMD ["npm", "run", "serve"]