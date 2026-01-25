
const axios = require('axios');

async function testLoginProvider() {
    try {
        const response = await axios.post('http://localhost:5454/auth/login', {
            email: 'mettoalex@gmail.com',
            password: 'Digital2025',
            userType: 'provider'
        });
        console.log('Provider Login successful:', response.data);
    } catch (error) {
        console.error('Provider Login failed:', error.response ? error.response.data : error.message);
    }
}

testLoginProvider();
