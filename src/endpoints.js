'use strict';

const HTTP_STATUS_CODES = {
    OK: '200',
    MOVED_PERMANENTLY: '301',
    FOUND: '302',
    BAD_REQUEST: '400',
    NOT_FOUND: '404',
    INTERNAL_SERVER_ERROR: '500',
}

const success = (callback, data, content_type = "application/json", enable_cors = true) => callback(null, {
    statusCode: '200',
    body: content_type == "application/json" ? JSON.stringify({data}) : data,
    headers: enable_cors ? {
        'Content-Type': content_type,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
    } : {
        'Content-Type': content_type,
    },
});

const failure = (callback, error, http_status_code, enable_cors = true) => callback(null, {
    statusCode: http_status_code ? http_status_code : '500',
    body: JSON.stringify({error}),
    headers: enable_cors ? {
        'Content-Type': "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
    } : {
        'Content-Type': "application/json",
    },
});

module.exports = {
    echo (event, context, callback) {
        console.log("\nEcho: ");
        console.log({event, context});
        console.log("-------");
        success(callback, {event, context});
    },
    simulate_failure (event, context, callback) {
        console.log("\nFailing: ");
        console.log({event, context});
        console.log("-------");
        failure(callback, "Test failure response");
    },
    simulate_bad_request (event, context, callback) {
        console.log("\nBad request: ");
        console.log({event, context});
        console.log("-------");
        failure(callback, "Test bad request response", HTTP_STATUS_CODES.BAD_REQUEST);
    },
}
