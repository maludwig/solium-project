/**
 * Created by Mitchell on 4/20/2017.
 */
/**
 * Created by Mitchell on 4/19/2017.
 */
var expect = require('chai').expect;
var moment = require('moment');

// Change this to match the ServiceEndpoint item in the output of ```$ serverless deploy -v```
// const SERVICE_ENDPOINT = 'https://asdf12345.execute-api.us-west-2.amazonaws.com/dev';


describe("Figuring out Moment.js", function () {
    describe("Date parser", function () {
        it("Correctly parses a date of the form YYYYMMDD", function () {
            var jan1_2014 = moment("20140101","YYYYMMDD");
            var jun22_2014 = moment("20140622","YYYYMMDD");
            var bad = moment("20140229","YYYYMMDD");
            console.log(jan1_2014.format("MMMM Do, Y"));
            console.log(jun22_2014.format("MMMM Do, Y"));
            console.log(bad.isValid());
        });
    });

});
