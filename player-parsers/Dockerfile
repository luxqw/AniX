FROM node:23-alpine

LABEL org.opencontainers.image.source=https://github.com/radiquum/anix

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY *.ts ./

EXPOSE 7000
ENV PORT=7000
ENV HOSTNAME="0.0.0.0"
CMD ["npm", "run", "serve"]