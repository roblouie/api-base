const Promise = require('bluebird');
const User = require('../models/user');
const JWT = require('jwt-async');
const securityConfig = require('../config/security-config');
const jwt = Promise.promisifyAll(new JWT());
jwt.setSecret(securityConfig.jwtSecret);

module.exports = {
    authenticateAndGenerateToken,
    generateToken
};

function authenticateAndGenerateToken(username, password) {
    return Promise.coroutine(function* () {
        const user = yield User.where('username', username).fetch();
        const isValidPassword = yield user.validPassword(password);
        if (isValidPassword) {
            const token = yield generateToken(user);
            return Promise.resolve(token);
        } else {
            return Promise.reject(new Error("Authentication failed"));
        }
    })();
}

function generateToken(user) {
    return jwt.signAsync(user.omit('password'))
        .then(token => 'JWT ' + token);
}