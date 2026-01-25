
const axios = require('axios');

async function testRegister() {
    try {
        const response = await axios.post('http://localhost:5454/auth/register', {
            email: 'test_kiplimo@yahoo.com',
            password: 'Digital2025',
            fname: 'Test',
            lname: 'Kiplimo',
            mobile: '0712345678',
            national_id: '12345678',
            dob: '1990-01-01',
            sex: 'male'
        });
        console.log('Registration successful:', response.status);
    } catch (error) {
        console.error('Registration failed:', error.response ? error.response.data : error.message);
    }
}

testRegister();
