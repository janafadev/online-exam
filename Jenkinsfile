pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    options {
        disableConcurrentBuilds()
    }

    parameters {
        string(
            name: 'MYSQL_HOST_PORT',
            defaultValue: '3307',
            description: 'Port MySQL accessible depuis la machine Jenkins'
        )
        string(
            name: 'MYSQL_DATABASE',
            defaultValue: 'exam_db',
            description: 'Nom de la base MySQL'
        )
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/janafadev/online-exam.git'
            }
        }

        stage('Prepare Permissions') {
            steps {
                sh 'chmod +x mvnw'
            }
        }

        stage('Compile') {
            steps {
                sh './mvnw clean compile'
            }
        }

        stage('Test') {
            steps {
                sh './mvnw test'
            }
        }

        stage('Package JAR') {
            steps {
                sh './mvnw package -DskipTests'
            }
        }

        stage('Security Scan') {
            steps {
                echo '🛡️ Running Security Scan for vulnerabilities...'
                sh '''
                    if command -v trivy >/dev/null 2>&1; then
                        trivy fs --severity HIGH,CRITICAL --exit-code 0 .
                    else
                        echo "⚠️ Trivy non détecté sur l'agent, exécution du scan des dépendances avec Maven..."
                        ./mvnw org.owasp:dependency-check-maven:check -DfailOnError=false || ./mvnw dependency:analyze || true
                    fi
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    env.IMAGE_NAME = "online-exam:${env.BUILD_NUMBER}"
                }

                sh '''
                    docker info >/dev/null
                    docker build --pull -t "$IMAGE_NAME" .
                '''
            }
        }

        stage('Deploy on Jenkins Host') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'exam-db-credentials',
                    usernameVariable: 'DB_USERNAME',
                    passwordVariable: 'DB_PASSWORD'
                )]) {
                    sh '''
                        set +x
                        docker volume create exam-uploads

                        if docker container inspect online-exam >/dev/null 2>&1; then
                            docker rm -f online-exam
                        fi

                        docker run -d \
                            --name online-exam \
                            --restart unless-stopped \
                            -p 7890:7890 \
                            --add-host host.docker.internal:host-gateway \
                            --env "DB_URL=jdbc:mysql://host.docker.internal:${MYSQL_HOST_PORT}/${MYSQL_DATABASE}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC" \
                            --env DB_USERNAME \
                            --env DB_PASSWORD \
                            -v exam-uploads:/app/uploads \
                            "$IMAGE_NAME"

                        for i in $(seq 1 30); do
                            if docker logs online-exam 2>&1 | grep -q "Started "; then
                                echo "✅ Application démarrée"
                                docker image prune -f
                                exit 0
                            fi
                            if [ "$(docker container inspect --format='{{.State.Running}}' online-exam)" != "true" ]; then
                                echo "❌ Le conteneur s'est arrêté"
                                docker logs online-exam
                                exit 1
                            fi
                            sleep 2
                        done

                        echo "❌ Timeout au démarrage"
                        docker logs online-exam
                        exit 1
                    '''
                }
            }
        }
    }

    post {
        always {
            echo '📊 Recording JUnit test results...'

            junit allowEmptyResults: true, testResults: 'target/surefire-reports/*.xml'

            echo '📦 Archiving JAR artifact...'

            archiveArtifacts(
                artifacts: 'target/*.jar',
                allowEmptyArchive: true
            )
        }

        success {
            echo '✅ Jenkins Build, Tests and Packaging completed successfully!'
        }

        failure {
            echo '❌ Jenkins Build failed.'
        }
    }
}