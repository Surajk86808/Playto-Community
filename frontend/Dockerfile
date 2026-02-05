#1. The stage name MUST match the --from= name below
FROM node:20-alpine AS build

WORKDIR /app

# Arguments for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

RUN npm install -g serve

# 2. This "build" must match the name in line 1
COPY --from=build /app/dist ./dist

ENV PORT=8080
EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]