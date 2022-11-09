/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const passport = require('passport');
const appID = require('ibmcloud-appid');

const constants = require('../services/Constants');

const { APIStrategy } = appID;
const appIDUrl = process.env.APP_ID_OAUTH_SERVER_URL;

passport.use(
    new APIStrategy({
        oauthServerUrl: appIDUrl,
    })
);

const authenticateStandardUser = passport.authenticate(APIStrategy.STRATEGY_NAME, {
    session: false,
});

const authenticateGenerateChallenge = passport.authenticate(APIStrategy.STRATEGY_NAME, {
    session: false,
    scope: constants.APP_ID_ROLES.GENERATE_CHALLENGE,
});

const authenticateVerifyChallenge = passport.authenticate(APIStrategy.STRATEGY_NAME, {
    session: false,
    scope: constants.APP_ID_ROLES.VERIFY_CHALLENGE,
});

module.exports = {
    authenticateStandardUser,
    authenticateGenerateChallenge,
    authenticateVerifyChallenge,
};
