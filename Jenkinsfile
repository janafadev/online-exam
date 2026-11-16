pipeline {
    agent any

    triggers {
        githubPush()
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

        stage('Build and Push Docker Image') {
            steps {
                script {
                    if (!env.DOCKERHUB_REPOSITORY?.trim()) {
                        error('Configure DOCKERHUB_REPOSITORY dans les propriétés globales de Jenkins (exemple : mon-compte/online-exam).')
                    }
                    env.IMAGE_REPOSITORY = env.DOCKERHUB_REPOSITORY.trim()
                }

                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKERHUB_USERNAME',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    sh '''
                        set +x
                        echo "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin
                        trap 'docker logout >/dev/null 2>&1 || true' EXIT

                        docker build --pull \
                            -t "$IMAGE_REPOSITORY:$BUILD_NUMBER" \
                            -t "$IMAGE_REPOSITORY:latest" .
                        docker push "$IMAGE_REPOSITORY:$BUILD_NUMBER"
                        docker push "$IMAGE_REPOSITORY:latest"
                    '''
                }
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
                        docker pull "$IMAGE_REPOSITORY:$BUILD_NUMBER"
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
                            "$IMAGE_REPOSITORY:$BUILD_NUMBER"

                        docker container inspect --format='{{.State.Running}}' online-exam | grep -q true
                    '''
                }
            }
        }
    }

    post {
        always {
            echo '📊 Recording JUnit test results...'

            junit 'target/surefire-reports/*.xml'

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