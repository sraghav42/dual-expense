# Step 1: Build JAR using Maven on OpenJDK 25
FROM maven:3.9-eclipse-temurin-25 AS builder

WORKDIR /build

# Copy pom.xml and download dependencies for layer caching
COPY pom.xml ./
RUN mvn dependency:go-offline -B || true

# Copy source code and build production package
COPY src ./src
RUN mvn clean package -DskipTests -B

# Step 2: Lightweight Runtime container using Temurin JRE 25
FROM eclipse-temurin:25-jre-alpine AS runner

# Run as non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy executable jar from builder stage
COPY --from=builder /build/target/*.jar app.jar

RUN chown -R spring:spring /app

USER spring:spring

EXPOSE 8080

# Production JVM flags optimized for container memory constraints (e.g. 1GB-2GB VPS)
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

# Container healthcheck using Spring Boot Actuator
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
