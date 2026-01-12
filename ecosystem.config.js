module.exports = {
    apps: [
        {
            name: 'mclinic-api',
            cwd: '/var/www/mclinicportal/apps/api',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3434,
                DB_HOST: 'localhost',
                DB_PORT: 3306,
                DB_USER: 'm-cl-app',
                DB_PASSWORD: 'Mclinic@App2023?',
                DB_NAME: 'mclinic',
                JWT_SECRET: 'MCL_PROD_XyZ9_RANDOM_SECRET_KEY_2025',
                JWT_EXPIRES_IN: '7d',
                FRONTEND_URL: 'https://portal.mclinic.co.ke',
                API_URL: 'https://portal.mclinic.co.ke/api'
            }
        },
        {
            name: 'mclinic-web',
            cwd: '/var/www/mclinicportal/apps/web',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3034,
                NEXT_PUBLIC_API_URL: 'https://portal.mclinic.co.ke/api'
            }
        }
    ]
};
