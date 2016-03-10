'use strict';

const express = require('express');
const Promise = require('bluebird');
const User = require('../models/user');
const authService = require('../services/auth-service');

const router = express.Router();

router.post('/login', (req, res) => {
    const {username, password} = req.body;
    authService.authenticateAndGenerateToken(username, password)
        .then(token => res.json({ token, success: true }))
        .catch(error => res.json({ error: 'Authentication failed', success: false }));
});

router.post('/register', function(req, res) {
    const {username, password} = req.body;
    User.forge({username, password}).save()
        .then(() => { return authService.authenticateAndGenerateToken(username, password) })
        .then(token => res.json({token, success: true}))
        .catch(error => {
            if (error.code === 'ER_DUP_ENTRY') {
                res.json({ error: 'Username already taken', success: false });
            } else {
                res.json({ error: 'User creation failed', success: false });
            }
        });
});

module.exports = router;