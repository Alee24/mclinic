
const axios = require('axios');
const querystring = require('querystring');
const https = require('https');

async function probeNCK(query) {
    const baseUrl = 'https://osp.nckenya.go.ke/ajax/public';
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    try {
        const payload = querystring.stringify({
            search_register: '1',
            search_text: query
        });

        const res = await axios.post(baseUrl, payload, {
            httpsAgent: httpsAgent,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest',
                'Origin': 'https://osp.nckenya.go.ke',
                'Referer': 'https://osp.nckenya.go.ke/LicenseStatus'
            }
        });

        console.log('--- DATA ---');
        const html = String(res.data);
        const start = html.indexOf('<tbody>');
        const end = html.indexOf('</tbody>');
        console.log(html.substring(start, end + 8));
    } catch (error) {
        console.error('PROBE FAILED:', error.message);
    }
}

const query = process.argv[2] || '405224';
probeNCK(query);
