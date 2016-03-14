'use strict';
const facebookConfig = require('../config/facebook-config');
const authService = require('./auth-service');
const uuid = require('node-uuid');
const Promise = require('bluebird');
const url = require('url');
const request = Promise.promisify(require("request"));
const User = require('../models/user');

module.exports = {
    loginWithFacebook
};

function loginWithFacebook(shortLivedToken) {
    return doesAppIdInTokenMatchOurAppId(shortLivedToken)
        .then(getLongLivedTokenFromFacebook)
        .then(getUserInfoFromFacebook)
        .then(findOrCreateUser)
        .then(generateJwtToken)
}

function doesAppIdInTokenMatchOurAppId(shortLivedToken) {
    return request(`https://graph.facebook.com/debug_token?input_token=${shortLivedToken}&access_token=${facebookConfig.appID}|${facebookConfig.secret}`)
        .then(response => {
            const responseJson = JSON.parse(response.body);
            if (responseJson.error) throw new Promise.OperationalError(responseJson.error.message);
            if (responseJson.data.app_id !== facebookConfig.appID) throw new Promise.OperationalError("App IDs do not match");
            return shortLivedToken;
        });
}

function getLongLivedTokenFromFacebook(shortLivedToken) {
    return request(`https://graph.facebook.com/oauth/access_token?client_id=${facebookConfig.appID}&client_secret=${facebookConfig.secret}&grant_type=fb_exchange_token&fb_exchange_token=${shortLivedToken}`)
        .then(response => {
            //Parsing the response string is due to the fact that if there are no errors facebook responds to oauth/access_token
            //with a query string-like format like so: access_token={long-term-token}&expires={expiration}
            //By adding '?' to the start of that string it can be parsed as query string
            const parsedResponseString = url.parse('?' + response.body, true).query;
            return parsedResponseString.access_token;
        });
}

function getUserInfoFromFacebook(longLivedToken) {
    return request('https://graph.facebook.com/me?fields=email,first_name,last_name&access_token=' + longLivedToken)
        .then(response => {
            const responseJson = JSON.parse(response.body);
            if (responseJson.error) throw new Promise.OperationalError(responseJson.error.message);
            const userInfo = responseJson;
            userInfo.longLivedToken = longLivedToken;
            return userInfo;
        });
}

function findOrCreateUser(userInfo) {
    return User.where('username', userInfo.email).fetch()
        .then(user => {
            if (!user) {
                return User.forge({
                    username: userInfo.email,
                    password: uuid.v1(),
                    first_name: userInfo.firstName,
                    last_name: userInfo.lastName,
                    facebook_id: userInfo.id,
                    facebook_token: userInfo.longLivedToken
                }).save()
            }
            return user
        });
}

function generateJwtToken(user) {
    return authService.generateToken(user);
}

