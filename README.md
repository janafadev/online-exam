# 🚀 Online Exam System – Java (Spring Boot)

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-blue?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot 3.2">
  <img src="https://img.shields.io/badge/MySQL-Database-orange?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/Spring%20Security-6-green?style=for-the-badge&logo=springsecurity&logoColor=white" alt="Spring Security 6">
  <img src="https://img.shields.io/badge/Jenkins-CI%2FCD-red?style=for-the-badge&logo=jenkins&logoColor=white" alt="Jenkins CI/CD">
</p>

Une application web complète de **gestion et de passage d'examens en ligne**, développée avec **Spring Boot 3**, **Spring Security**, **Thymeleaf**, **Bootstrap 5** et **MySQL**.

Elle fournit un environnement sécurisé, ergonomique et responsive pour les **Administrateurs** (gestionnaires d'épreuves) et les **Étudiants** (candidats).

---

## 📌 Sommaire

- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Architecture & Structure du Projet](#-architecture--structure-du-projet)
- [Prérequis](#-prérequis)
- [Configuration de l'Environnement](#-configuration-de-lenvironnement)
- [Lancement de l'Application](#-lancement-de-lapplication)
- [Intégration Continue (Jenkins CI/CD)](#-intégration-continue-jenkinscicd)
- [Comptes & Accès par Défaut](#-comptes--accès-par-défaut)
- [Licence](#-licence)

---

## ✨ Fonctionnalités

### 👨‍💻 Espace Administrateur
- **Authentification sécurisée** par rôle (`ROLE_ADMIN`).
- **Tableau de bord statistique** : Nombre total d'étudiants, d'examens, de questions et de soumissions.
- **Gestion des Examens (CRUD)** : Titre, durée (minutée), description, activation.
- **Gestion des Questions (CRUD)** : Questions à choix multiples associées à chaque examen avec protection contre la suppression accidentelle des questions déjà évaluées.
- **Gestion des Étudiants** : Consultation de la liste des inscrits, réinitialisation de mot de passe, suppression de compte en cascade.
- **Suivi des Résultats** : Visualisation globale des notes et des détails de soumission de tous les étudiants.

### 🧑‍🎓 Espace Étudiant
- **Inscription & Connexion** : Formulaire complet avec photo de profil.
- **Tableau de bord personnalisé** : Indicateurs clés (KPIs) et graphique de performance (Chart.js).
- **Passage d'examen interactif** :
  - Pagination des questions et palette de navigation directe.
  - Minuteur en temps réel avec **soumission automatique** à la fin du temps imparti.
- **Résultats instantanés** : Score, pourcentage, statut de réussite (Pass/Fail).
- **Correction détaillée** : Page de révision affichant les réponses fournies vs réponses correctes.
- **Gestion du profil** : Mise à jour des informations personnelles, mot de passe et avatar.

---

## 🛠️ Stack Technique

| Composant | Technologie |
| :--- | :--- |
| **Langage & Framework** | Java 21, Spring Boot 3.2.0 |
| **Sécurité** | Spring Security 6 (BCrypt Password Encoding, sessions HTTP) |
| **Frontend & Rendu** | Thymeleaf, Bootstrap 5, Chart.js, HTML5/CSS3 |
| **Persistance & ORM** | Spring Data JPA, Hibernate |
| **Base de Données** | MySQL (connecteur `mysql-connector-j`) |
| **Configuration** | Fichier `.env` & `application.properties` |
| **Build & Dépendances** | Apache Maven (`mvnw`) |
| **Intégration Continue** | Jenkins Pipeline déclaratif (`Jenkinsfile`) |

---

## 📂 Architecture & Structure du Projet

```text
online-exam-system/
├── .env                              # Variables d'environnement locales (BDD, ports...)
├── Jenkinsfile                       # Définition du pipeline CI/CD Jenkins
├── pom.xml                           # Configuration Maven et dépendances
├── mvnw / mvnw.cmd                   # Maven Wrapper (Linux / Windows)
└── src/
    ├── main/
    │   ├── java/com/example/exam/
    │   │   ├── config/               # Configuration Spring Security, Upload, etc.
    │   │   ├── controller/           # Contrôleurs Web (AdminController, StudentController, etc.)
    │   │   ├── model/                # Entités JPA (User, Exam, Question, Result...)
    │   │   ├── repository/           # Interfaces Spring Data JPA
    │   │   ├── service/              # Logique métier et UserDetailsService
    │   │   └── OnlineExamApplication.java  # Point d'entrée & initialisation de l'administrateur
    │   └── resources/
    │       ├── application.properties # Configuration Spring Boot
    │       ├── static/               # CSS, JS (Chart.js, timer), Images
    │       └── templates/            # Vues Thymeleaf (Admin, Student, Auth)
    └── test/                         # Tests unitaires et d'intégration
```

---

## ⚙️ Prérequis

- **Java Development Kit (JDK) 21** ou supérieur.
- **MySQL 8.x** (local ou conteneur Docker).
- **Git** pour le versionnement.
- **Jenkins** (recommandé pour exécuter les étapes CI/CD automatisées).

---

## 🔧 Configuration de l'Environnement

L'application charge automatiquement ses variables depuis le fichier `.env` situé à la racine du projet :

1. Créez ou modifiez le fichier `.env` à la racine :

```dotenv
DB_HOST=localhost
DB_PORT=3307
DB_NAME=exam_db
DB_USERNAME=exam_user
DB_PASSWORD=exam_secure_password_2026
DB_URL=jdbc:mysql://localhost:3307/exam_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
PORT=7890
```

2. Assurez-vous que votre serveur MySQL est démarré et que l'utilisateur dispose des droits nécessaires.

---

## 🚀 Lancement de l'Application

### Option 1 : Avec le Maven Wrapper

Sous Linux / macOS :
```bash
chmod +x mvnw
./mvnw clean spring-boot:run
```

Sous Windows (PowerShell / CMD) :
```powershell
.\mvnw.cmd clean spring-boot:run
```

### Option 2 : Compiler le package JAR

```bash
./mvnw clean package -DskipTests
java -jar target/online-exam-0.0.1-SNAPSHOT.jar
```

Une fois lancée, l'application est accessible à l'adresse suivante :
👉 **http://localhost:7890**

---

## 🔄 Intégration Continue (Jenkins CI/CD)

Le projet intègre un pipeline déclaratif automatisé configuré dans le fichier [`Jenkinsfile`](./Jenkinsfile).

### Étapes du Pipeline :

1. **Checkout** : Récupération du code source depuis la branche principale.
2. **Prepare Permissions** : Attribution des droits d'exécution sur `./mvnw`.
3. **Compile** : Compilation propre du code (`./mvnw clean compile`).
4. **Test** : Exécution des tests automatisés avec Maven (`./mvnw test`).
5. **Package JAR** : Génération du livrable JAR (`./mvnw package -DskipTests`).
6. **Security Scan** : Analyse des vulnérabilités de sécurité et dépendances (Trivy / OWASP).
7. **Post-Actions** :
   - Enregistrement et publication des résultats JUnit (`target/surefire-reports/*.xml`).
   - Archivage de l'artefact JAR (`target/*.jar`).

---

## 🔐 Comptes & Accès par Défaut

Au premier démarrage, l'application initialise automatiquement un compte administrateur dans la base de données :

| Rôle | Nom d'utilisateur | Mot de passe | URL d'accès |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin` | `adminpass` | `http://localhost:7890/login` |
| **Étudiant** | *Créé via formulaire* | *Défini à l'inscription* | `http://localhost:7890/register` |

---

## 📜 Licence

Ce projet est distribué sous licence open-source **MIT**.
