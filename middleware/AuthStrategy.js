/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const appIDAuth = require('./AppID');
const constants = require('../services/Constants');

const getAuthStrategy = (role) => {
    let authStrategy;
    if (role === constants.APP_ID_ROLES.GENERATE_CHALLENGE) {
        authStrategy = appIDAuth.authenticateGenerateChallenge;
    } else if (role === constants.APP_ID_ROLES.VERIFY_CHALLENGE) {
        authStrategy = appIDAuth.authenticateVerifyChallenge;
    } else {
        authStrategy = appIDAuth.authenticateStandardUser;
    }

    return authStrategy;
};

module.exports = {
    getAuthStrategy,
};
