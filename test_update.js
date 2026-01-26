
const axios = require('axios');

async function testUpdate() {
    try {
        // First login to get token
        const loginRes = await axios.post('http://localhost:5454/auth/login', {
            email: 'mettoalex@gmail.com',
            password: 'Digital2025',
            userType: 'provider'
        });
        const token = loginRes.data.access_token;

        console.log('Got token');

        const res = await axios.patch('http://localhost:5454/doctors/1', {
            licenceExpiryDate: '2027-01-01',
            fee: 10
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Update successful:', res.data);
    } catch (error) {
        console.error('Update failed:', error.response ? error.response.data : error.message);
    }
}

testUpdate();
