/* eslint-disable no-console */
/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

require('dotenv').config();

const { ApiBootstrapper } = require('dhp-http-lib');
const http = require('http');
const passport = require('passport');
const path = require('path');

const apiRoutes = require('./routes');

const serverPort = process.env.PORT || 30001;

const bootstrapper = new ApiBootstrapper(path.join(__dirname, 'api/swagger.json'), 'healthpass-challenge-api');

const app = bootstrapper.createExpressApp();

app.use(passport.initialize());

app.use('/', apiRoutes);

app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'No route found',
        },
    });
});

http.createServer(app).listen(serverPort, () => {
    console.log('Server started on port %d (http://localhost:%d)', serverPort, serverPort);
    console.log('Swagger-UI is available on http://localhost:%d/api-docs/', serverPort);
});

module.exports = app;
