const http = require('http');

function checkUsers() {
    http.get('http://localhost:3001/users/count-active', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('User Count Response:', data);
        });
    }).on('error', (e) => console.error(e));
}

checkUsers();
