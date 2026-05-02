const fs = require('fs');
const path = require('path');

function findEnv() {
    const paths = [
        path.join(process.cwd(), '.env'),
        path.join(process.cwd(), '..', '..', '.env'),
        path.join(process.cwd(), '..', '..', '..', '.env')
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return null;
}

function loadEnv(filePath) {
    if (!filePath) return;
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            if (!process.env[key]) process.env[key] = value;
        }
    });
}

const envPath = findEnv();
loadEnv(envPath);

const user = process.env.DB_USER || process.env.DB_USERNAME || process.env.USER;
const pass = process.env.DB_PASSWORD || process.env.DB_PASS || process.env.PASSWORD || '';
const host = process.env.DB_HOST || process.env.DB_HOSTNAME || 'localhost';
const port = process.env.DB_PORT || '3306';
const name = process.env.DB_NAME || process.env.DB_DATABASE || 'mclinic';

if (!user || !name) {
    console.error('Missing DB_USER or DB_NAME in environment');
    process.exit(1);
}

// Encode password for URL
const encodedPass = encodeURIComponent(pass);
const url = `mysql://${user}:${encodedPass}@${host}:${port}/${name}`;

console.log(url);
