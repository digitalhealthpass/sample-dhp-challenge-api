/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const qs = require('qs');
const { HttpClient } = require('dhp-http-lib');

const responseUtils = require('../common/response');

/**
 * generates access token
 *
 * @param {object} req
 * @returns TokenResponse
 **/
exports.generateToken = (req) => {
    const { body, logger } = req;

    logger.info('Starting generateToken...');

    return new Promise((resolve, reject) => {
        // create an http client for POST method with basic auth credentials and application/x-www-form-urlencoded data
        const httpClient = new HttpClient({
            url: `${process.env.APP_ID_OAUTH_SERVER_URL}/token`,
            method: 'POST',
            contentType: 'application/x-www-form-urlencoded',
            auth: {
                username: process.env.APP_ID_CLIENT_ID,
                password: process.env.APP_ID_SECRET,
            },
            data: qs.stringify({
                grant_type: 'password',
                username: body.username,
                password: body.password,
            }),
            logger,
        });

        logger.info('Invoke AppID token service...');
        httpClient
            .invoke()
            .then((response) => {
                logger.info('Completed generateToken successfully...');
                resolve(response.data);
            })
            .catch((error) => {
                logger.error(error);

                if (error.response && error.response.status === 400) {
                    // invalid clientid/username/password request
                    reject([
                        responseUtils.errorResponse(
                            400,
                            'Bad Request',
                            'Invalid client_id/username/password given in the request',
                            ''
                        ),
                        400,
                    ]);
                } else if (error.response && error.response.status === 401) {
                    // invalid secret in server configuration
                    reject([
                        responseUtils.errorResponse(
                            500,
                            'Server Error',
                            'Invalid client_id and secret configuration',
                            ''
                        ),
                        500,
                    ]);
                } else if (error.code === 'ENOTFOUND') {
                    // invalid appid url
                    reject([
                        responseUtils.errorResponse(500, 'Server Error', 'Invalid appid service url configuration', ''),
                        500,
                    ]);
                } else {
                    // unhandled errors
                    reject([responseUtils.errorResponse(500, 'Server Error', error, ''), 500]);
                }
            });
    });
};
