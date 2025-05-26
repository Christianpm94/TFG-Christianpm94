# Etapa 1: Build
FROM node:20-alpine AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build -- --configuration production

# Etapa 2: Nginx para producción
FROM nginx:alpine

COPY --from=build /app/dist/football-app/browser /usr/share/nginx/html
COPY nginx.custom.conf /etc/nginx/conf.d/default.conf
