FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the prebuilt Spring Boot executable JAR (Frontend & Backend bundled)
COPY app.jar app.jar

# Directory for file-based analytics
RUN mkdir -p /app/data

# Render automatically provides $PORT environment variable
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
