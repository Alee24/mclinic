
const axios = require('axios');

async function testLoginPatient() {
    try {
        const response = await axios.post('http://localhost:5454/auth/login', {
            email: 'test_kiplimo@yahoo.com',
            password: 'Digital2025',
            userType: 'patient'
        });
        console.log('Login response:', response.data.user);
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
    }
}

testLoginPatient();
