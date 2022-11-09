/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

const chai = require('chai');
const uuid = require('uuid');
const { JWS, JWK: { asKey } } = require('jose');
const { Logger } = require('dhp-logging-lib');

const IdentityVerificationService = require('../../../services/IdentityVerificationService');

const { expect } = chai;

process.env.CACHE_TTL = 60;

const payload = { challenge: { nonce: '+dPrjjfrFE/CBHRUjolVxg==' } };
const publicKey =
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu6+7Af4AohhPbKQQyN20' +
    '2Sg78gyG4EDywWLgyrxdjUe8ZUAwRdJm8zgBwFZOdooE3BcMYyH8w2gQJmgxrb6p' +
    'WPkLAkxRoB3buGlG2BQBcS9OubJfLCgDXL6Jv/QoTy/9cUhFIUbMEe62VQKbcwr6' +
    '/8ukZYQ2U561oCrBDDRbtA4B5GQUACUv0Qf1gOB2OIMpq4iPdZ3fqwGv1uYz5E/Z' +
    '6LBmJvERkhxigVjGeUcjWBfW2sxxX5wx5biMcR1DTBpKmQeH6SzbgpLgp/IPtQMf' +
    'iTqEiS1P3Cfu/+BKV9fWxJfytulnD8DbvDsQEhiADCjXlKSkKtTEHAvpoFoEb5Jk' +
    'hwIDAQAB';

const privateKey =
    '-----BEGIN PRIVATE KEY-----\n' +
    'MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC7r7sB/gCiGE9s' +
    'pBDI3bTZKDvyDIbgQPLBYuDKvF2NR7xlQDBF0mbzOAHAVk52igTcFwxjIfzDaBAm' +
    'aDGtvqlY+QsCTFGgHdu4aUbYFAFxL065sl8sKANcvom/9ChPL/1xSEUhRswR7rZV' +
    'AptzCvr/y6RlhDZTnrWgKsEMNFu0DgHkZBQAJS/RB/WA4HY4gymriI91nd+rAa/W' +
    '5jPkT9nosGYm8RGSHGKBWMZ5RyNYF9bazHFfnDHluIxxHUNMGkqZB4fpLNuCkuCn' +
    '8g+1Ax+JOoSJLU/cJ+7/4EpX19bEl/K26WcPwNu8OxASGIAMKNeUpKQq1MQcC+mg' +
    'WgRvkmSHAgMBAAECggEAaJEarpx2e9jxf0TVOSQUmxxIca27A3wMA+Rz+2AA+zKp' +
    'avvdKTl1NDLS/vbW1kJFPN32f9Cyw6fZv5wzeWqNbU2rbYdZvsyD2vWEi+RxfT7v' +
    'LJSNY8uTO/vIQVLllmDVYmTyZvzLu330xd4i/3BxsUwi9pA3uFTnOio3zfXp1aE3' +
    '+bLGBQ6Fxhh3U0e60+rWa2lRwM2qPuVSt6CKhUYPJsRf4GySIPR6Oa9EpVg2txbl' +
    '8xc23t1oRdhn7lnCk2ZKTnr18w/lQAZNjSaLENlQ+7ZyRfB9+lSZSbIKHpLNm/cV' +
    'cfFUXV0+QAI26hQxiQewhUUlfuxOBGIyFFs+/PLDEQKBgQDcdutrr5cSAQruqzuo' +
    '413hC11S2DCGtC2zHjxu09EH1GZiDbsVcDQN6yDPjOOEXjWFGdZmCd0tQEfzshLW' +
    'edrfFvxGxKdWi/OEKA0HEIqS6jrdR43MmB/jPgqbVpSt3jIDd4gOLftqaRM1vNm2' +
    '9Bzn+zuWq1dP67TBW3RPJ2Vn/wKBgQDZ8Efz4CXTdhpkx4eifVfcMhhIyuRQMHEw' +
    'JE+z7ivnNlTy77yKPSKCEwdPvnd9hgbTjyjOPuw5tItRY1C6FzJjYGjLfppBnxAP' +
    '9k5h7zNbX8vyIh3MkbDCVz+E3QIJ14z0voJKabbVg1yHT7EOic8NxpfG6m7tVJ83' +
    'FkGqJZPDeQKBgCu6brGaT2WjzU5PqnKyPmGvxl/zP5TIUjQv8B6vZsudxnz2akAz' +
    'VC/ajlR8hngv03/GAy+UD0m1cVAV5wShgNc1EO7cfLB+69svsn3POx0u1mQjmC2X' +
    'kuOY37O19aGS6+qiH9toJXESzFuhTLGsM7uTqlsVOylAAEdF44j7sHJzAoGAat9j' +
    'yXof0oTWCJm4L7ybu0VtlzS3pYM73knQNAIV0XpZShC6OmgkZfkC2t4iJpH1AwXv' +
    'EsTUfq/EqhKz4a3Cbe03NqNM7eUcsVcttOTiIGrnzkNgrZK8RXEXmwXuG/lyDAro' +
    'Ral1mVqjo083GlQGD1FV2JvZ7dRTh2YIqXFn9rECgYAlklQdFcqBsIHhriySW9Ii' +
    '1sFJve/2d/8RmbVz7EU24ZNmM3rqc+5fJwXw7M2uaZVg6htzDWRy332x78ngHXU5' +
    'XnP11yHubprqHtIsrrHUMqTDme8LOKB2WEbWM2C3ifR8HftAT/DItQBUp5Rb9nOl' +
    '8Db3s+PIS2EMTXBYjZrIkg==' +
    '\n-----END PRIVATE KEY-----';

class Cache {
    // eslint-disable-next-line class-methods-use-this
    set() {
        return Promise.resolve(true);
    }

    // eslint-disable-next-line class-methods-use-this
    get() {
        return Promise.resolve(payload.challenge.nonce);
    }
}

const challengeCache = new Cache();

const logger = new Logger({
    name: 'challenge-api',
    correlationId: uuid.v4(),
});

describe('Identity Verification Service : generateIdentityChallenge', () => {
    it('should return nonce', (done) => {
        IdentityVerificationService.generateIdentityChallenge({ body: {}, logger }, challengeCache).then((response) => {
            expect(response.challenge.nonce.length).to.equal(24);
            done();
        });
    });
});

describe('Identity Verification Service : verifyIdentity', () => {
    it('should return verified true', (done) => {
        const signature = JWS.sign(
            JSON.stringify(payload.challenge),
            asKey(Buffer.from(privateKey), { alg: 'RS256' }),
            {
                alg: 'RS256',
            }
        );

        IdentityVerificationService.verifyIdentity(
            {
                body: {
                    public_key: publicKey,
                    signature,
                },
                logger,
            },
            challengeCache
        ).then((response) => {
            expect(response).to.deep.equal({ verified: true });
            done();
        });
    });

    it('should return verified false when the payload is empty', (done) => {
        const signature = JWS.sign({}, asKey(Buffer.from(privateKey), { alg: 'RS256' }), { alg: 'RS256' });

        IdentityVerificationService.verifyIdentity(
            {
                body: {
                    public_key: publicKey,
                    signature,
                },
                logger,
            },
            challengeCache
        )
            .then((response) => {
                expect(response.verified).to.equal(false);
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});
