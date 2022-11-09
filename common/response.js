/**
 * Digital Health Pass 
 *
 * (c) Copyright Merative US L.P. and others 2020-2022 
 *
 * SPDX-Licence-Identifier: Apache 2.0
 */

exports.errorResponse = (code, message, trace, path) => {
    const errorTrace = (typeof trace !== 'string') ? JSON.stringify(trace) : trace;

    return {
        message,
        trace: errorTrace,
        errors: [
            {
                errorCode: code.toString(),
                message,
                path,
            },
        ],
    };
};
