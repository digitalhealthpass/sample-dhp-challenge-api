/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const { Cache } = require('dhp-cache-lib');

const IdentityVerification = require('../services/IdentityVerificationService');

const challengeCache = new Cache(undefined, {
    name: 'challenge',
});

module.exports.generateIdentityChallenge = (req, res) => {
    IdentityVerification.generateIdentityChallenge(req, challengeCache)
        .then((response) => {
            res.json(response);
        })
        .catch(([response, status]) => {
            res.status(status).send(response);
        });
};

module.exports.verifyIdentity = (req, res) => {
    IdentityVerification.verifyIdentity(req, challengeCache)
        .then((response) => {
            res.json(response);
        })
        .catch(([response, status]) => {
            res.status(status).send(response);
        });
};
