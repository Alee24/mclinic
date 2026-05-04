module.exports = {
    apps: [
        {
            name: 'mclinic-api',
            script: 'dist/main.js',
            cwd: '/var/www/mclinicportal/apps/api',
            interpreter: 'node',
            env: {
                NODE_ENV: 'production',
                PORT: 7899,
                DB_HOST: 'localhost',
                DB_PORT: 3306,
                DB_USER: 'm-cl-app',
                DB_PASSWORD: 'Mclinic@App2023?',
                DB_NAME: 'mclinicportal',
                DATABASE_URL: 'mysql://m-cl-app:Mclinic%40App2023%3F@localhost:3306/mclinicportal',
                MPESA_ENV: 'production',
                MPESA_PROD_CONSUMER_KEY: 'fAXn4oBQdyFoxN0amp4SsP7wi1N8Cyew',
                MPESA_PROD_CONSUMER_SECRET: 'ijbw3rFdhG8GLFcJ',
                MPESA_PROD_PASSKEY: 'd6f8d245cf3fc6fec0ec4c2182980e1243936cb21706ebce9b036cc579cba879',
                MPESA_PROD_SHORTCODE: '300977',
                MPESA_PROD_CALLBACK_URL: 'https://portal.mclinic.co.ke/api/mpesa/callback',
                MPESA_CALLBACK_URL: 'https://portal.mclinic.co.ke/api/mpesa/callback',
                JWT_SECRET: 'MCL_PROD_XyZ9_RANDOM_SECRET_KEY_2025',
                JWT_EXPIRES_IN: '7d',
                FRONTEND_URL: 'https://portal.mclinic.co.ke',
                SMTP_HOST: 'mail.mclinic.co.ke',
                SMTP_PORT: '465',
                SMTP_USER: 'info@mclinic.co.ke',
                SMTP_PASS: 'Digital2025',
                SMTP_FROM: 'info@mclinic.co.ke',
                API_URL: 'https://portal.mclinic.co.ke/api'
            },
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            error_file: '/var/www/mclinicportal/logs/api-error.log',
            out_file: '/var/www/mclinicportal/logs/api-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss'
        },
        {
            name: 'mclinic-web',
            script: 'npm',
            args: 'run start',
            cwd: '/var/www/mclinicportal/apps/web',
            env: {
                PORT: 7898,
                NODE_ENV: 'production',
                NEXT_PUBLIC_API_URL: 'https://portal.mclinic.co.ke/api'
            },
            instances: 1,
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            error_file: '/var/www/mclinicportal/logs/web-error.log',
            out_file: '/var/www/mclinicportal/logs/web-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss'
        }
    ]
};
