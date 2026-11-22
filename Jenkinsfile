
pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    parameters {
        string(
            name: 'MYSQL_DATABASE',
            defaultValue: 'exam_db',
            description: 'Nom de la base MySQL'
        )

        string(
            name: 'APP_PORT',
            defaultValue: '7890',
            description: 'Port HTTP expose sur la machine hote'
        )
    }

    environment {
        IMAGE_NAME = "online-exam:${BUILD_NUMBER}"
        CONTAINER_NAME = 'online-exam'
        MYSQL_CONTAINER = 'online-exam-mysql'
        DOCKER_NETWORK = 'online-exam-network'
        UPLOAD_VOLUME = 'exam-uploads'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Recuperation du projet GitHub...'

                git branch: 'master',
                    url: 'https://github.com/janafadev/online-exam.git'
            }
        }

        stage('Prepare Permissions') {
            steps {
                sh '''
                    chmod +x mvnw
                    echo "Maven Wrapper pret."
                '''
            }
        }

        stage('Check Environment') {
            steps {
                sh '''
                    echo "=== Java ==="
                    java -version

                    echo "=== Maven ==="
                    ./mvnw -version

                    echo "=== Docker ==="
                    docker --version
                    docker info >/dev/null

                    echo "Docker Engine accessible."
                '''
            }
        }

        stage('Check Infrastructure') {
            steps {
                sh '''
                    echo "=== Verification du reseau Docker ==="

                    docker network inspect "$DOCKER_NETWORK" >/dev/null

                    echo "=== Verification MySQL ==="

                    docker container inspect "$MYSQL_CONTAINER" >/dev/null

                    docker exec "$MYSQL_CONTAINER" \
                        mysqladmin ping -h 127.0.0.1 --silent

                    echo "MySQL est operationnel."
                '''
            }
        }

        stage('Compile') {
            steps {
                echo 'Compilation du projet...'

                sh './mvnw clean compile'
            }
        }

        stage('Test') {
            steps {
                echo 'Execution des tests unitaires...'

                sh './mvnw test'
            }
        }

        stage('Package JAR') {
            steps {
                echo 'Creation du fichier JAR...'

                sh './mvnw package -DskipTests'
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Analyse de securite des dependances...'

                sh '''
                    if command -v trivy >/dev/null 2>&1; then
                        trivy fs \
                            --severity HIGH,CRITICAL \
                            --exit-code 0 .
                    else
                        echo "Trivy non detecte."
                        echo "Execution du Dependency Check Maven."

                        ./mvnw org.owasp:dependency-check-maven:check \
                            -DfailOnError=false || true
                    fi
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Construction de l image Docker...'

                sh '''
                    docker info >/dev/null

                    docker build \
                        --pull \
                        -t "$IMAGE_NAME" .
                '''

                echo 'Image Docker construite.'
            }
        }

        stage('Deploy on Jenkins Host') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'exam-db-credentials',
                        usernameVariable: 'DB_USERNAME',
                        passwordVariable: 'DB_PASSWORD'
                    )
                ]) {
                    sh '''
                        set -eu
                        set +x

                        echo "=== Preparation du deploiement ==="

                        docker network inspect "$DOCKER_NETWORK" >/dev/null

                        docker volume create "$UPLOAD_VOLUME" >/dev/null

                        echo "=== Verification de MySQL ==="

                        docker exec "$MYSQL_CONTAINER" \
                            mysqladmin ping -h 127.0.0.1 --silent

                        echo "=== Suppression ancienne version ==="

                        if docker container inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
                            docker rm -f "$CONTAINER_NAME"
                        fi

                        echo "=== Demarrage nouvelle version ==="

                        docker run -d \
                            --name "$CONTAINER_NAME" \
                            --restart unless-stopped \
                            --network "$DOCKER_NETWORK" \
                            -p "${APP_PORT}:7890" \
                            --env "DB_URL=jdbc:mysql://${MYSQL_CONTAINER}:3306/${MYSQL_DATABASE}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \
                            --env "DB_USERNAME=${DB_USERNAME}" \
                            --env "DB_PASSWORD=${DB_PASSWORD}" \
                            -v "${UPLOAD_VOLUME}:/app/uploads" \
                            "$IMAGE_NAME"

                        echo "=== Verification du demarrage ==="

                        for i in $(seq 1 45); do

                            RUNNING=$(docker inspect \
                                --format='{{.State.Running}}' \
                                "$CONTAINER_NAME" 2>/dev/null || echo false)

                            if [ "$RUNNING" != "true" ]; then
                                echo "ERREUR : le conteneur est arrete."
                                docker logs "$CONTAINER_NAME" || true
                                exit 1
                            fi

                            if docker logs "$CONTAINER_NAME" 2>&1 | grep -q "Started "; then
                                echo "Application Spring Boot demarree."

                                echo "=== Nettoyage des anciennes images ==="

                                docker image prune -f

                                echo "Deploiement termine avec succes."
                                exit 0
                            fi

                            sleep 2
                        done

                        echo "ERREUR : timeout au demarrage."

                        docker logs "$CONTAINER_NAME"
                        exit 1
                    '''
                }
            }
        }
    }

    post {

        always {
            echo 'Enregistrement des resultats des tests...'

            junit(
                allowEmptyResults: true,
                testResults: 'target/surefire-reports/*.xml'
            )

            echo 'Archivage des fichiers JAR...'

            archiveArtifacts(
                artifacts: 'target/*.jar',
                allowEmptyArchive: true
            )
        }

        success {
            echo 'BUILD, TESTS ET DEPLOIEMENT REUSSIS !'
            echo 'Application : http://localhost:7890'
        }

        failure {
            echo 'ECHEC DU PIPELINE JENKINS.'

            echo 'Verification des logs du conteneur...'

            sh '''
                docker logs online-exam 2>&1 | tail -100 || true
            '''
        }
    }
}
