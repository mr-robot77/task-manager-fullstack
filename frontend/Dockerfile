FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build -- --configuration=production

FROM nginx:alpine

ARG BUILD_VERSION=unknown
COPY --from=build /app/dist/task-manager-frontend/browser /usr/share/nginx/html
RUN sed -i "s|<head>|<head><!-- Build: ${BUILD_VERSION} -->|" /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
