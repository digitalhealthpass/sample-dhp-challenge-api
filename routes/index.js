/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const express = require('express');

const AuthenticationController = require('../controllers/AuthenticationController');
const HealthController = require('../controllers/HealthController');
const IdentityVerificationController = require('../controllers/IdentityVerificationController');
const constants = require('../services/Constants');
const authStrategy = require('../middleware/AuthStrategy');

const checkAuthGenerateChallenge = authStrategy.getAuthStrategy(constants.APP_ID_ROLES.GENERATE_CHALLENGE);
const checkAuthVerifyIdentity = authStrategy.getAuthStrategy(constants.APP_ID_ROLES.VERIFY_IDENTITY);

const router = express.Router();

router.post('/login', AuthenticationController.generateToken);
router.get('/health', HealthController.getHealth);
router.post('/generate', checkAuthGenerateChallenge, IdentityVerificationController.generateIdentityChallenge);
router.post('/verify', checkAuthVerifyIdentity, IdentityVerificationController.verifyIdentity);

module.exports = router;
