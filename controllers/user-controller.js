'use strict';

const express = require('express');
const User = require('../models/user');
const jwtAuth = require('../middlewear/jwt-authenticate');
const authorizedRoles = require('../middlewear/roles-authorize');

const router = express.Router();

router.get('/', function(req, res) {
    User.fetchAll().then(function(users) {
        res.json(users);
    });
});

router.get('/securedArea', jwtAuth, authorizedRoles('Rob', 'Someone Else'), function(req, res) {
    res.json({msg: "You made it to the secure area"});
});

module.exports = router;