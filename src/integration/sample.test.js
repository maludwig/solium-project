/**
 * Created by Mitchell on 4/20/2017.
 */
/**
 * Created by Mitchell on 4/19/2017.
 */
var expect = require('chai').expect;
var spawn = require('child_process').spawn;
var fs = require('fs');

// Change this to match the ServiceEndpoint item in the output of ```$ serverless deploy -v```
// const SERVICE_ENDPOINT = 'https://asdf12345.execute-api.us-west-2.amazonaws.com/dev';

function generateHandler (input_file_path, expected_output_file_path) {
    return function (done) {
//        var test_process = spawn('node', ['src/solve-sample1-20140101.js']);
        var test_process = spawn('node', ['main.js']);
        var full_stdout_data = '';
        var full_stderr_data = '';
        test_process.stdout.on('data', (data) => {
            full_stdout_data += data;
        });
        test_process.stderr.on('data', (data) => {
            throw new Error(`STDERR written to: ${data}`);
        });
        fs.createReadStream(input_file_path).pipe(test_process.stdin);
        test_process.on('close', (code) => {
            var verify_file_contents = fs.readFileSync(expected_output_file_path, { encoding : 'utf8'});
            console.log(`Ended with ${code}\nSTDOUT:\n${full_stdout_data}\n\nSTDERR:\n${full_stderr_data}\n\n`);
            expect(full_stdout_data).to.equal(verify_file_contents);
            done();
        });
    }
}
describe("Integration test to confirm that sample inputs produce correct output", function () {
    describe("First sample", function () {
        it("Works with the date set to 20140101", generateHandler('templates/sample1-20140101-in.def', 'templates/sample1-20140101-out.def'));
        it("Works with the date set to 20120614", generateHandler('templates/sample1-20120615-in.def', 'templates/sample1-20120615-out.def'));
    });
    describe("Second sample", function () {
        it("Works with the date set to 20140101", generateHandler('templates/sample2-20140101-in.def', 'templates/sample2-20140101-out.def'));
        it("Works with the date set to 20130101", generateHandler('templates/sample2-20130101-in.def', 'templates/sample2-20130101-out.def'));
    });
    describe("Third sample", function () {
        it("Works with the date set to 20140101", generateHandler('templates/sample3-20140101-in.def', 'templates/sample3-20140101-out.def'));
        it("Works with the date set to 20130101", generateHandler('templates/sample3-20130101-in.def', 'templates/sample3-20130101-out.def'));
    });
});
