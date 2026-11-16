# --- Étape 1 : Construction (Build) ---
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Mise en cache des dépendances Maven
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copie du code source et compilation du package JAR
COPY src ./src
RUN mvn clean package -DskipTests

# --- Étape 2 : Image d'Exécution (Runtime) ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Création des dossiers pour les uploads et fichiers temporaires
RUN mkdir -p /app/uploads /app/data/tmp && chown -R appuser:appgroup /app

# Récupération du fichier JAR compilé depuis l'étape précédente
COPY --from=builder /build/target/*.jar app.jar

# Utilisation de l'utilisateur non-root
USER appuser

# Exposition du port de l'application
EXPOSE 7890

# Variables d'environnement par défaut
ENV PORT=7890 \
    SPRING_PROFILES_ACTIVE=prod

# Commande de démarrage
ENTRYPOINT ["java", "-jar", "app.jar"]

