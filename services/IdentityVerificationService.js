/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const crypto = require('crypto');
const { JWS, JWK: { asKey } } = require('jose');

const responseUtils = require('../common/response');

/**
 * generate an identity challenge message to share with an identity holder
 *
 * @param {object} req
 * @param {object} cache instance
 * @returns ChallengeIdentityResponse
 **/
exports.generateIdentityChallenge = (req, cache) => {
    const { body, logger } = req;

    logger.info('Starting generateIdentityChallenge...');

    return new Promise((resolve, reject) => {
        const nonce = crypto.randomBytes(16).toString('base64');
        const value = body && body.public_key ? body.public_key : nonce;

        logger.info('Set nonce value in cache...');

        cache
            .set(nonce, value, parseInt(process.env.CACHE_TTL, 10))
            .then(() => {
                logger.info('Completed generateIdentityChallenge successfully...');
                resolve({ challenge: { nonce } });
            })
            .catch((error) => {
                logger.error(error);
                reject([responseUtils.errorResponse(500, 'Server Error', error, ''), 500]);
            });
    });
};

/**
 * verify an identity holder's response to an identify challenge
 *
 * @param {object} req
 * @param {object} cache instance
 * @returns VerifyIdentityResponse
 **/
exports.verifyIdentity = (req, cache) => {
    const { body, logger } = req;

    logger.info('Starting verifyIdentity...');

    // TODO: check if we need to reject here
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
        const { signature } = body;
        let nonce;

        try {
            let publicKey = body.public_key;

            if (!publicKey.includes('BEGIN')) {
                /**
                 * adding beginning and trailing comments for the
                 * public key as they are missing in the request public_key
                 * and to avoid serialization issues with module
                 */
                // eslint-disable-next-line prefer-template
                publicKey = '-----BEGIN PUBLIC KEY-----\n' + publicKey + '\n-----END PUBLIC KEY-----';
            }

            const key = asKey(Buffer.from(publicKey), { alg: 'RS256' });
            const payload = JWS.verify(signature, key, { alg: 'RS256' });
            nonce = payload.nonce || (payload.challenge ? payload.challenge.nonce : undefined);
            if (!nonce) {
                throw new Error("'nonce' is missing from the signature payload. Expected $.nonce or $.challenge.nonce");
            }
        } catch (error) {
            logger.error(error);

            resolve({
                verified: false,
                reason: error.message,
            });
            return;
        }

        logger.info('Verify nonce value from cache...');

        cache
            .get(nonce)
            .then((cachedNonceValue) => {
                if (cachedNonceValue && (cachedNonceValue === nonce || cachedNonceValue === body.public_key)) {
                    logger.info('Completed verifyIdentity successfully...');
                    resolve({
                        verified: true,
                    });
                } else {
                    logger.info('Identity verification failed...');
                    resolve({
                        verified: false,
                        reason: 'The nonce has expired or there is a public key mismatch',
                    });
                }
            })
            .catch((error) => {
                logger.error(error);
                resolve({
                    verified: false,
                    reason: error.message,
                });
            });
    });
};
