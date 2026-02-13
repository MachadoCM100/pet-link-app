# ---------- Base dependencies layer ----------
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- Development target ----------
FROM deps AS dev
# Copy source AFTER deps for caching
COPY . .
EXPOSE 4200
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "4200"]

# ---------- Build target ----------
FROM deps AS build
COPY . .
RUN npm run build

# ---------- Production runtime ----------
FROM nginx:1.25-alpine AS prod
COPY --from=build /app/dist/petlink /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

