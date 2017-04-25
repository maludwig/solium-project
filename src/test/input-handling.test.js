/**
 * Created by Mitchell on 4/23/2017.
 */

var expect = require('chai').expect;
var input_handling = require('../obj/input-handling');
var spawn = require('child_process').spawn;
var fs = require('fs');
var stream = require('stream');

describe("Input Handling", function () {
    describe("InputHandler Class", function () {
        it("Can handle basic input", function (done) {
            var input_handler = new input_handling.InputHandler(function (output) {
                try {
                    expect(output).to.equal('Mitch,500.00');
                    done();
                } catch (ex) {
                    done(ex);
                }
            });
            input_handler.ingestLine("1");
            input_handler.ingestLine("VEST,Mitch,20140101,100,5");
            input_handler.ingestLine("20140101,10");
        });
        it("Can handle streams", function (done) {
            var fileReadStream = fs.createReadStream("./templates/sample3-20140101-in.def");
            var desiredOutput = fs.readFileSync("./templates/sample3-20140101-out.def").toString();
            var monitorStream = new stream.Writable();

            monitorStream._write = function (chunk, encoding, callback) {
                expect(chunk.toString()).to.equal(desiredOutput);
                callback();
                done();
            };
            input_handling.handleStream(fileReadStream, monitorStream);
        });
        it("Can handle strings", function () {
            var string_input = fs.readFileSync("./templates/sample3-20130101-in.def").toString();
            var expected_output = fs.readFileSync("./templates/sample3-20130101-out.def").toString();
            var output = input_handling.handleString(string_input);
            expect(output).to.equal(expected_output);
        });
    });
});
