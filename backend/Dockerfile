# =========================
# Build stage（ビルド用）
# =========================
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# 1) Wrapper を明示的にコピー
COPY gradlew /app/gradlew
COPY gradle/wrapper/gradle-wrapper.jar /app/gradle/wrapper/gradle-wrapper.jar
COPY gradle/wrapper/gradle-wrapper.properties /app/gradle/wrapper/gradle-wrapper.properties

# 2) 実行権限（保険）
RUN chmod +x /app/gradlew

# 3) 依存解決用にビルドファイルだけコピー
COPY build.gradle settings.gradle /app/

# 4) 依存解決
RUN ./gradlew --no-daemon dependencies

# 5) ソースをコピーして jar 作成
COPY src /app/src
RUN ./gradlew --no-daemon clean bootJar

# =========================
# Runtime stage（実行用）
# =========================
FROM eclipse-temurin:21-jre
WORKDIR /app

RUN useradd -m appuser
USER appuser

# build stageで作ったjarをコピー
COPY --from=build /app/build/libs/*.jar /app/app.jar

ENV PORT=8080
EXPOSE 8080

# Javaの起動（Spring Boot）
# -Dserver.port は application.yml の ${PORT:8080} と合わせておくとどちらでも動く
CMD ["java", "-Dserver.port=${PORT}", "-jar", "/app/app.jar"]
