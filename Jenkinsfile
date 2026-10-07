pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Deskhaus storefront') {
            steps {
                bat '''
                    if not exist index.html (
                        echo Missing index.html
                        exit /b 1
                    )
                    if not exist style.css (
                        echo Missing style.css
                        exit /b 1
                    )
                    if not exist script.js (
                        echo Missing script.js
                        exit /b 1
                    )
                    echo All Deskhaus storefront files are present.
                '''
            }
        }

        stage('Archive storefront') {
            steps {
                archiveArtifacts artifacts: 'index.html,style.css,script.js',
                                 fingerprint: true
            }
        }
    }
}