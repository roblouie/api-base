'use strict';

const express = require('express');
const url = require('url');
const jwt = require('jwt-simple');
const User = require('../models/user');
const facebookConfig = require('../config/facebook-config');
const uuid = require('node-uuid');
const Promise = require('bluebird');
const request = Promise.promisify(require("request"));
Promise.promisifyAll(request);

const router = express.Router();

router.post('/login', (req, res) => {
    request(`https://graph.facebook.com/oauth/access_token?client_id=${facebookConfig.appID}&client_secret=${facebookConfig.secret}&grant_type=fb_exchange_token&fb_exchange_token=${req.body.shortLivedToken}`)
        .then(facebookResponse => {
            //Parsing the response string is due to the fact that facebook responds to oauth/access_token
            //with a query string like so: access_token={long-term-token}&expires={expiration}
            //By adding '?' to the start of that string it can be parsed like a query string
            const parsedResponseString = url.parse('?' + facebookResponse.body, true).query;
            const longLivedToken = parsedResponseString.access_token;
            const expires = parsedResponseString.expires;
            request('https://graph.facebook.com/me?fields=email,first_name,last_name&access_token=' + longLivedToken)
            .then(response => {
                const userInfo = JSON.parse(response.body);
                User.forge({
                    username: userInfo.first_name + userInfo.last_name,
                    password: uuid.v1()
                }).save()
                .then(user => res.json(user));
            })
        })
        .catch(err => {
            console.log(err)
        });
});

module.exports = router;