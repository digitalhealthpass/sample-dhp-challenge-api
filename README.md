# sample-dhp-challenge-api
Provides authentication/authorization as well as identity verification

## Implementation notes
- `generateToken` will be used for authenticating. Clients will provide their AppID `username`, and `password` and get back a token that includes the scopes to which they have acces. *(decided on 2020/08/04)*
- Caching will be delegated to [dhp-cache-lib](https://github.com/digitalhealthpass/dhp-cache-lib) *(decided on 2020/08/04)*
- Logging will be delegated to [dhp-logging-lib](https://github.com/digitalhealthpass/dhp-logging-lib) *(decided on 2020/08/04)*
- HTTP calls will be delegated to [dhp-http-lib](https://github.com/digitalhealthpass/dhp-http-lib) *(decided on 2020/08/04)*
- [jose](https://www.npmjs.com/package/jose) will be used for JWS verification *(decided on 2020/08/04)*

## Operation details

### generateToken

*Flow*
1. Client invokes `generateToken`, passing `username`, and `password`
2. API will resolve the `appid_client_id` and `appid_client_secret` using environment variables (inherited from the cluster)
3. API will invoke the "login" operation on App ID
4. API will return the response, transforming it to comply with the API specification

### generateIdentityChallenge

*Flow*
1. Client invokes `generateIdentityChallenge`, passing a token from `generateToken` in the Authorization header, and *optionally* providing `public_key` in the request body. `public_key` represents the psuedonym of the user (i.e. Holder or Employee) which is present in all verifiable credentials that are issued to users.
2. API will generate a random string (nonce) and cache the association the nonce and the `public_key` from Step 1. If `public_key` is not provided, the nonce should be specified as both the cache key and value. The cache entry should expire after 1 minute (this should be configurable via `process.env`)
3. API will return the challenge response, per the API specification

### verifyIdentity

*Flow*
1. Client invokes `verifyIdentity`, passing a token from `generateToken` in the Authorization header, providing `public_key` and `signature` in the request body. `signature` is a JSON Web Signature ([JWS](https://en.wikipedia.org/wiki/JSON_Web_Signature)) and represents the hash of the `challenge` of a response from `generateIdentityChallenge`
2. API validates the signature, using `public_key` (see https://github.com/panva/jose/blob/HEAD/docs/README.md#jwsverifyjws-keyorstore-options)
3. If the signature is valid, API extracts the nonce from the payload and find a matching cache entry for `public_key` and the nonce.
4. If a match is found, API sets `verified` to true in the response body

## Deployment 
### AppID scopes & roles
The following scopes should be configured in AppID:
- gen_id_challenge
- verify_identity

Following is the default roles created in AppID instance, during deployment:
- challenge-admin
  - with scopes: gen_id_challenge, verify_identity

A user with above role should be onboarded to use this api.

### Environment Variables
The environment variables support - and in some cases *expected* - by the component. An environment variable that is marked `required` but not available to the component will result in the component not starting.

|Name|Required|Description|
| -- | ------ | --------- |
|APP_ID_OAUTH_SERVER_URL|yes|AppID oauth url used to generate access tokens|
|APP_ID_CLIENT_ID|yes|AppID application clientID|
|APP_ID_SECRET|yes|AppID application secret|
|OAUTH_TOKEN_VERIFICATION_URL|yes|AppID verification/introspect endpoint|
|OAUTH_SERVICE_CLIENT_ID|yes|AppID service clientID|
|OAUTH_SERVICE_CLIENT_SECRET|yes|AppID service secret|
|CACHE_TTL|yes|Used to set default caching period|
