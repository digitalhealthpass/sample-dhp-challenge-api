/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const chai = require('chai');
const nock = require('nock');
const uuid = require('uuid');
const { Logger } = require('dhp-logging-lib');

const AuthenticationService = require('../../../services/AuthenticationService');

const { expect } = chai;

process.env.APP_ID_OAUTH_SERVER_URL = 'https://us-south.appid.cloud.ibm.com/oauth/v4/tenantid';
process.env.APP_ID_CLIENT_ID = 'clientID';
process.env.APP_ID_SECRET = 'secret';

const logger = new Logger({
    name: 'challenge-api',
    correlationId: uuid.v4(),
});

describe('Authentication Service : generateToken', () => {
    beforeEach(() => {
        nock.cleanAll();
    });

    it('should return expected response', (done) => {
        nock(process.env.APP_ID_OAUTH_SERVER_URL, { allowUnmocked: false })
            .post('/token', 'grant_type=password&username=test%40mail.com&password=test')
            .reply(200, {});

        AuthenticationService.generateToken({
            body: {
                username: 'test@mail.com',
                password: 'test',
            },
            logger,
        })
            .then((response) => {
                expect(response).to.deep.equal({});
                done();
            })
            .catch((error) => {
                done(error);
            });
    });

    it('should return 400 for invalid username/password', (done) => {
        nock(process.env.APP_ID_OAUTH_SERVER_URL, { allowUnmocked: false })
            .post('/token', 'grant_type=password&username=test%40mail.com&password=test')
            .reply(400, {});

        AuthenticationService.generateToken({
            body: {
                username: 'test@mail.com',
                password: 'test',
            },
            logger,
        }).catch((error) => {
            expect(error[0].message).to.equal('Bad Request');
            expect(error[1]).to.equal(400);
            done();
        });
    });

    it('should return 500 for invalid clientid secret config', (done) => {
        nock(process.env.APP_ID_OAUTH_SERVER_URL, { allowUnmocked: false })
            .post('/token', 'grant_type=password&username=test%40mail.com&password=test')
            .reply(401, {});

        AuthenticationService.generateToken({
            body: {
                username: 'test@mail.com',
                password: 'test',
            },
            logger,
        }).catch((error) => {
            expect(error[0].message).to.equal('Server Error');
            expect(error[1]).to.equal(500);
            done();
        });
    });

    it('should return 500 for invalid appid url in config', (done) => {
        nock(process.env.APP_ID_OAUTH_SERVER_URL, { allowUnmocked: false })
            .post('/token', 'grant_type=password&username=test%40mail.com&password=test')
            .reply(404, { code: 'ENOTFOUND' });

        AuthenticationService.generateToken({
            body: {
                username: 'test@mail.com',
                password: 'test',
            },
            logger,
        }).catch((error) => {
            expect(error[0].message).to.equal('Server Error');
            expect(error[1]).to.equal(500);
            done();
        });
    });
});
