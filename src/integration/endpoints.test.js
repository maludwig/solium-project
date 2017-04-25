/**
 * Created by Mitchell on 4/19/2017.
 */
var fs = require('fs');
var expect = require('chai').expect;
var request = require('request').defaults({
    json: true,
});

// Change this to match the ServiceEndpoint item in the output of ```$ serverless deploy -v```
const SERVICE_ENDPOINT = 'https://6690k4mle0.execute-api.us-west-2.amazonaws.com/dev';


/**
 * Tests the Amazon API Gateway / Lambda integration
 */
describe("Integration tests for endpoints", function () {
    this.timeout(2000);
    describe("Make sure the SERVICE_ENDPOINT has been set properly", function () {
        it("Passes a regex check", function () {
            const ENDPOINT_VALIDATING_REGEX = /^https:\/\/[a-z0-9]+\.execute-api\.[a-z0-9-]+.amazonaws.com\/[a-zA-Z0-9-]+$/;
            expect(SERVICE_ENDPOINT).to.be.a('string');
            expect(ENDPOINT_VALIDATING_REGEX.test(SERVICE_ENDPOINT)).to.be.true;
        });
    });
    describe("/calc endpoint", function () {
        function generateTest(input_path, expected_output_path) {
            it(`POST ${input_path}`, function (done) {
                var expected_output = fs.readFileSync(expected_output_path).toString();
                fs.createReadStream(input_path).pipe(request.post({
                    url: `${SERVICE_ENDPOINT}/calc`,
                }, function (error, response, body) {
                    expect(error).to.be.null;
                    expect(response.statusCode).to.equal(200);
                    expect(body).to.equal(expected_output);
                    done();
                }));
            });
        }
        generateTest('./templates/sample1-20120615-in.def', './templates/sample1-20120615-out.def');
        generateTest('./templates/sample1-20140101-in.def', './templates/sample1-20140101-out.def');
        generateTest('./templates/sample2-20130101-in.def', './templates/sample2-20130101-out.def');
        generateTest('./templates/sample2-20140101-in.def', './templates/sample2-20140101-out.def');
        generateTest('./templates/sample3-20130101-in.def', './templates/sample3-20130101-out.def');
        generateTest('./templates/sample3-20140101-in.def', './templates/sample3-20140101-out.def');
        generateTest('./templates/unicode1-in.def', './templates/unicode1-out.def');
        generateTest('./templates/unicode2-in.def', './templates/unicode2-out.def');
        generateTest('./templates/negative-in.def', './templates/negative-out.def');
    })
});
