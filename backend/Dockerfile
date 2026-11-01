# Stage 1: Build the Java backend fat JAR
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Lightweight runtime environment
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN mkdir -p receipts

COPY --from=builder /app/target/unibook-backend-1.0.0.jar app.jar

EXPOSE 8080

ENV PORT=8080

CMD ["java", "-jar", "app.jar"]
