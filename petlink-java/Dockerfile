# ---------- DEV ----------
FROM maven:3.9.6-eclipse-temurin-21 AS dev
WORKDIR /app
CMD ["mvn", "spring-boot:run"]


# ---------- DEPS (for caching) ----------
FROM maven:3.9.6-eclipse-temurin-21 AS deps
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# ---------- BUILD ----------
FROM deps AS BUILD
COPY src ./src
RUN mvn -B package -DskipTests


# ---------- RUNTIME ----------
FROM eclipse-temurin:21-jre
WORKDIR /app

# Avoid running as root for security
RUN useradd -ms /bin/bash appuser
USER appuser

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]



