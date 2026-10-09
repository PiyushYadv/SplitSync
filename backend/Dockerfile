# syntax=docker/dockerfile:1
# Official Eclipse Temurin images, pulled from Amazon's public mirror of Docker Hub's library to avoid
# Docker Hub's anonymous pull limits on shared build machines.

# ---- Build ----
FROM public.ecr.aws/docker/library/eclipse-temurin:21-jdk-alpine AS build
WORKDIR /build
# Dependencies first, so they're cached until pom.xml changes.
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN ./mvnw -B -ntp dependency:go-offline
COPY src src
RUN ./mvnw -B -ntp package -DskipTests \
    && cp target/*.jar app.jar

# ---- Run ----
FROM public.ecr.aws/docker/library/eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /build/app.jar /tmp/app.jar
# Unpack the jar and do one training start to record a Class Data Sharing archive, which cuts startup time
# substantially on small CPUs. The training start exits as soon as the context is refreshed and must not
# need the database or Redis: migrations, schema validation and the Redis config step are skipped.
RUN java -Djarmode=tools -jar /tmp/app.jar extract --destination /app/application \
    && rm /tmp/app.jar \
    && java -XX:ArchiveClassesAtExit=/app/application/app.jsa -Dspring.context.exit=onRefresh \
        -Dspring.flyway.enabled=false -Dspring.jpa.hibernate.ddl-auto=none \
        -Dspring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=false \
        -Dapp.session.configure-redis=false \
        -jar /app/application/app.jar \
    && chown -R app:app /app
USER app

# Sized for small instances (e.g. 512 MB / 0.1 CPU): heap capped at 75% of the container's memory, the
# single-threaded GC, and C1-only JIT so startup isn't starved compiling hot code.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -Xss512k -XX:+ExitOnOutOfMemoryError"
# Render (and most hosts) set PORT; application.yml falls back to 8080.
EXPOSE 8080
ENTRYPOINT ["java", "-XX:SharedArchiveFile=/app/application/app.jsa", "-jar", "/app/application/app.jar"]
