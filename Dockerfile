# ----------------------------------------------------
# Stage 1: Build Frontend (Vite)
# ----------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ----------------------------------------------------
# Stage 2: Build Backend (Maven + Spring Boot)
# ----------------------------------------------------
FROM maven:3.9-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app

COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -B || true

COPY backend/src ./src

# Inject compiled Frontend into Spring Boot static resources
COPY --from=frontend-builder /app/frontend/dist/ ./src/main/resources/static/

RUN mvn clean package -DskipTests

# ----------------------------------------------------
# Stage 3: Minimal Production JRE Runtime
# ----------------------------------------------------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=backend-builder /app/target/*.jar app.jar
RUN mkdir -p /app/data

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
