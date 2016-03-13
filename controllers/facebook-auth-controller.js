'use strict';

const express = require('express');
const facebookService = require('../services/facebook-service');

const router = express.Router();

router.post('/login', (req, res) => {
    facebookService.loginWithFacebook(req.body.shortLivedToken)
        .then(token => res.json({ token, success: true }))
        .error(error => {
            console.log(error);
            res.status(500).send({ error: "There was an error logging in with facebook", facebookError: error });
        })
        .catch(error => {
            console.log(error);
            res.status(500).send({ error: "Unknown internal server error" });
        });
});

module.exports = router;
