const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function test() {
    try {
        // 1. Login as Admin/Doctor (or just any user) to get token
        // Use the test credentials
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'mettoalex@gmail.com',
            password: 'Digital2025'
        });
        const token = loginRes.data.access_token;
        const userId = loginRes.data.user.id;
        console.log('Logged in. Token:', token.substring(0, 20) + '...', 'User ID:', userId);

        // 2. Try to add medical record for SELF (just for testing ID resolution)
        const payload = {
            diagnosis: 'Test Diagnosis',
            prescription: 'Test Rx',
            notes: 'Testing backend ID resolution',
            doctorId: 1,
            patientId: userId // Sending User ID, expecting backend to resolve to Patient ID
        };

        console.log('Sending payload:', payload);

        const res = await axios.post(`${API_URL}/medical-records`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Success! Record created:', res.data);

    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

test();
