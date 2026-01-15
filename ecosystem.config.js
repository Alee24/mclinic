module.exports = {
    apps: [
        {
            name: 'mclinic-api',
            script: 'dist/main.js',
            cwd: '/var/www/mclinicportal/apps/api',
            interpreter: '/root/.nvm/versions/node/v20.20.0/bin/node',
            env: {
                NODE_ENV: 'production',
                PORT: 3434,
                DB_HOST: 'localhost',
                DB_PORT: 3306,
                DB_USER: 'm-cl-app',
                DB_PASSWORD: 'Mclinic@App2023?',
                DB_NAME: 'mclinicportal',
                DATABASE_URL: 'mysql://m-cl-app:Mclinic%40App2023%3F@localhost:3306/mclinicportal',
                JWT_SECRET: 'MCL_PROD_XyZ9_RANDOM_SECRET_KEY_2025',
                JWT_EXPIRES_IN: '7d',
                FRONTEND_URL: 'https://portal.mclinic.co.ke',
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
            script: '/root/.nvm/versions/node/v20.20.0/bin/npm',
            args: 'start',
            cwd: '/var/www/mclinicportal/apps/web',
            env: {
                PORT: 3034,
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
