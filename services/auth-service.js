const Promise = require('bluebird');
const User = require('../models/user');
const jwt = require('jwt-simple');
const securityConfig = require('../config/security-config');

module.exports = {
    authenticateAndGenerateToken(username, password) {
        return Promise.coroutine(function* () {
            const user = yield User.where('username', username).fetch();
            const isValidPassword = yield user.validPassword(password);
            if (isValidPassword) {
                const token = jwt.encode(user.omit('password'), securityConfig.jwtSecret);
                return Promise.resolve(token);
            } else {
                return Promise.reject(new Error("Authentication failed"));
            }
        })();
    }
};