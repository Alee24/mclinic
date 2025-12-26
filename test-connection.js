const http = require('http');

function testEndpoint(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3001${path}`, (res) => {
            console.log(`[${res.statusCode}] ${path}`);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', (e) => {
            console.error(`[ERROR] ${path}: ${e.message}`);
            resolve(null);
        });
    });
}

async function runTests() {
    console.log('--- Starting System Check ---');
    await testEndpoint('/');
    await testEndpoint('/financial/invoices'); // Might return 401 Unauthorized which is expected/good
    await testEndpoint('/doctors/admin/all'); // Check connectivity
    console.log('--- System Check Complete ---');
}

runTests();
