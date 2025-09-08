# Stage 1: Build the application using a multi-platform image
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy the entire project
COPY . .

# Make the Gradle wrapper executable
RUN chmod +x ./gradlew

# Build the application using the Gradle wrapper
RUN ./gradlew build -x test --no-daemon

# Stage 2: Create the final image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy only the built jar file from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]