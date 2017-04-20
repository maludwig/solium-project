/**
 * Created by Mitchell on 4/19/2017.
 */
var expect = require('chai').expect;
var request = require('request').defaults({
    json: true,
});

// Change this to match the ServiceEndpoint item in the output of ```$ serverless deploy -v```
const SERVICE_ENDPOINT = 'https://eysm8azp8f.execute-api.us-west-2.amazonaws.com/dev';


describe("Integration tests for endpoints", function () {
    this.timeout(2000);
    describe("echo function", function () {
        it("GET returns an HTTP 200 JSON response containing an event and a context", function (done) {
            request.get({
                url: `${SERVICE_ENDPOINT}/echo`,
                headers: {
                    "Authorization": "Token THISISATOKEN",
                },
            }, function (error, response, body) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.equal("application/json");
                expect(response.headers["access-control-allow-origin"]).to.equal("*");
                expect(response.headers["access-control-allow-credentials"]).to.equal("true");
                expect(body.error).to.be.undefined;
                expect(body.data.event).to.exist;
                expect(body.data.event.headers['Authorization']).to.equal("Token THISISATOKEN");
                expect(body.data.context).to.exist;
                done();
            });
        });
        it("POST returns an HTTP 200 JSON response containing an event and a context, the event body is the uploaded JSON", function (done) {
            var upload_data = {
                name: "Mitchell"
            };
            request.post({
                url: `${SERVICE_ENDPOINT}/echo`,
                headers: {
                    "Authorization": "Token THISISATOKEN",
                },
                json: upload_data,
            }, function (error, response, body) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.equal("application/json");
                expect(response.headers["access-control-allow-origin"]).to.equal("*");
                expect(response.headers["access-control-allow-credentials"]).to.equal("true");
                expect(body.error).to.be.undefined;
                expect(body.data.event).to.exist;
                expect(body.data.event.headers['Authorization']).to.equal("Token THISISATOKEN");
                expect(body.data.event.body).to.equal(JSON.stringify(upload_data));
                expect(body.data.context).to.exist;
                done();
            });
        });
    });

    describe("simulate_failure function", function () {
        it("GET returns an HTTP 500 response", function (done) {
            request.get({
                url: `${SERVICE_ENDPOINT}/failure`,
            }, function (error, response, body) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(500);
                expect(body.error).to.equal("Test failure response");
                expect(body.data).to.be.undefined;
                done();
            });
        });
        it("POST returns an HTTP 500 response", function (done) {
            request.post({
                url: `${SERVICE_ENDPOINT}/failure`,
            }, function (error, response, body) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(500);
                expect(body.error).to.equal("Test failure response");
                expect(body.data).to.be.undefined;
                done();
            });
        });
    });

    describe("simulate_bad_request function", function () {
        it("GET returns an HTTP 400 response", function (done) {
            request.get({
                url: `${SERVICE_ENDPOINT}/bad`,
            }, function (error, response, body) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(400);
                expect(body.error).to.equal("Test bad request response");
                expect(body.data).to.be.undefined;
                done();
            });
        });
        it("POST returns an HTTP 400 response", function (done) {
            request.post({
                url: `${SERVICE_ENDPOINT}/bad`,
            }, function (error, response, body) {
                expect(error).to.be.null;
                expect(response.statusCode).to.equal(400);
                expect(body.error).to.equal("Test bad request response");
                expect(body.data).to.be.undefined;
                done();
            });
        });
    });
});
