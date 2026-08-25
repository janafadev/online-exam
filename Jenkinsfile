pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master', url: 'https://github.com/janafadev/online-exam.git'
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
                sh './mvnw clean package -DskipTests'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'target/*.jar', allowEmptyArchive: true
        }
        success {
            echo '✅ Jenkins Build and Packaging completed successfully!'
        }
        failure {
            echo '❌ Jenkins Build failed.'
        }
    }
}
