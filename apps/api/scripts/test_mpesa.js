const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const env = process.env.MPESA_ENV || 'sandbox';

const url = env === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

async function test() {
    console.log('=========================================');
    console.log('📡 M-Pesa Integration Test (Token Check)');
    console.log('=========================================');
    console.log(`Environment: ${env}`);

    if (!consumerKey || !consumerSecret) {
        console.error('❌ Missing credentials in .env file.');
        console.error('Please ensure MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET are set.');
        return;
    }

    console.log(`Key: ${consumerKey.substring(0, 4)}****`);
    console.log(`Secret: ${consumerSecret.substring(0, 4)}****`);

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        console.log(`Connecting to: ${url}...`);
        const response = await axios.get(url, {
            headers: { Authorization: `Basic ${auth}` }
        });
        console.log('✅ SUCCESS: Access Token Generated!');
        console.log(`Token: ${response.data.access_token.substring(0, 20)}...`);
        console.log('Expires in:', response.data.expires_in);
    } catch (error) {
        console.error('❌ FAILED: Could not generate token.');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

test();
