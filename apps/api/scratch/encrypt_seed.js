const crypto = require('crypto');

function encrypt(value, keyString) {
    const key = crypto.createHash('sha256').update(keyString).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

const keyString = process.env.ENCRYPTION_KEY || 'MClinicDefaultSecretKeyShouldBeChanged';
console.log('fname:', encrypt('Metto', keyString));
console.log('lname:', encrypt('Alex', keyString));
console.log('mobile:', encrypt('0724454757', keyString));
