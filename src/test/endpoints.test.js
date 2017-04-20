var expect = require('chai').expect;
var endpoints = require('../endpoints');

describe("Endpoint tests", function () {
    describe("echo function", function () {
        it("Eventually returns an event and a context", function (done) {
            endpoints.echo({},{},function(error, response){
                try {
                    expect(error).to.be.null;
                    expect(response.statusCode).to.equal('200');
                    expect(response.body).to.be.a('string');
                    expect(response.headers).to.deep.equal({
                        'Content-Type': "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Credentials": true,
                    });
                    var parsed_body = JSON.parse(response.body);
                    expect(parsed_body.error).to.be.undefined;
                    var data = parsed_body.data;
                    expect(data.event).to.deep.equal({});
                    expect(data.context).to.deep.equal({});
                    done();
                } catch (exception) {
                    done(exception);
                }
            });
        });
        it("Eventually returns an event and a context with data", function (done) {
            var event = {
                name: "Mitchell Ludwig",
                pet: {
                    species: "dog",
                    age: 12
                },
            };
            var context = {
                time: "2017-01-01T13:59:12Z",
            }
            endpoints.echo(event,context,function(error, response){
                try {
                    expect(error).to.be.null;
                    expect(response.statusCode).to.equal('200');
                    expect(response.body).to.be.a('string');
                    expect(response.headers).to.deep.equal({
                        'Content-Type': "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Credentials": true,
                    });
                    var parsed_body = JSON.parse(response.body);
                    expect(parsed_body.error).to.be.undefined;
                    var data = parsed_body.data;
                    expect(data.event).to.deep.equal(event);
                    expect(data.context).to.deep.equal(context);
                    done();
                } catch (exception) {
                    done(exception);
                }
            });
        });
    });

    describe("simulate_failure function", function () {
        it("Eventually returns an HTTP 500 response", function (done) {
            endpoints.simulate_failure({},{},function(error, response){
                try {
                    expect(error).to.be.null;
                    expect(response.statusCode).to.equal('500');
                    expect(response.body).to.be.a('string');
                    expect(response.headers).to.deep.equal({
                        'Content-Type': "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Credentials": true,
                    });
                    var parsed_body = JSON.parse(response.body);
                    expect(parsed_body.error).to.equal("Test failure response");
                    expect(parsed_body.data).to.be.undefined;
                    done();
                } catch (exception) {
                    done(exception);
                }
            });
        });
    });

    describe("simulate_bad_request function", function () {
        it("Eventually returns an HTTP 400 error", function (done) {
            endpoints.simulate_bad_request({},{},function(error, response){
                try {
                    expect(error).to.be.null;
                    expect(response.statusCode).to.equal('400');
                    expect(response.body).to.be.a('string');
                    expect(response.headers).to.deep.equal({
                        'Content-Type': "application/json",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Credentials": true,
                    });
                    var parsed_body = JSON.parse(response.body);
                    expect(parsed_body.error).to.equal("Test bad request response");
                    expect(parsed_body.data).to.be.undefined;
                    done();
                } catch (exception) {
                    done(exception);
                }
            });
        });
    });
});
