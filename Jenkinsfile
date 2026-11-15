pipeline {
    agent any

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