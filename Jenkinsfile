pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'auth-frontend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        SONAR_SCANNER_HOME = tool 'sonar-scanner'
    }
    
    tools {
        nodejs 'NodeJS-18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm run test:ci'
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'coverage/junit.xml'
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube-Local') {
                    sh """
                        ${SONAR_SCANNER_HOME}/bin/sonar-scanner \\
                        -Dsonar.projectKey=auth-frontend \\
                        -Dsonar.projectName='Authentication Frontend' \\
                        -Dsonar.sources=src \\
                        -Dsonar.tests=src \\
                        -Dsonar.test.inclusions='**/*.test.tsx,**/*.test.ts' \\
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \\
                        -Dsonar.host.url=http://localhost:9000
                    """
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    def app = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    app.tag("latest")
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    sh """
                        docker stop auth-frontend-staging || true
                        docker rm auth-frontend-staging || true
                        docker run -d --name auth-frontend-staging -p 3001:80 ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker system prune -f'
        }
        success {
            echo 'Pipeline completed successfully!'
            echo "Application disponible sur: http://localhost:3001"
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}