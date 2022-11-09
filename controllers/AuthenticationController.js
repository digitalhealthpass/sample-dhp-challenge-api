/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const Authentication = require('../services/AuthenticationService');

module.exports.generateToken = (req, res) => {
    Authentication.generateToken(req)
        .then((response) => {
            res.json(response);
        })
        .catch(([response, status]) => {
            res.status(status).send(response);
        });
};
