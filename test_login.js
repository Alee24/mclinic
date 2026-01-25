
const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5454/auth/login', {
            email: 'mettoalex@gmail.com',
            password: 'Digital2025',
            userType: 'patient'
        });
        console.log('Login successful:', response.data);
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
    }
}

testLogin();
