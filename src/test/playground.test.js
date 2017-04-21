/**
 * Created by Mitchell on 4/20/2017.
 */
/**
 * Created by Mitchell on 4/20/2017.
 */
var expect = require('chai').expect;
var moment = require('moment');
var stocks = require('../obj/stocks');

describe.skip("Random tests", function () {
    describe("Sorting a bunch of numbers", function () {
        var numbers = [];
        var moments = [];
        it("Generates a bunch of numbers", function () {
            for(var i = 0; i < 100000; i++) {
                numbers.push(Math.random());
            }
        });
        it("Sorts the numbers", function () {
            numbers.sort();
        });
        it("Generates a bunch of moments", function () {
            for(var i = 0; i < 20000; i++) {
                moments.push({
                    recorded: moment.unix(Math.random()*1492741686),
                    name: "Mitchell",
                });
            }
        });
        it("Sorts the moments", function () {
            moments.sort(function (a, b) {
                return a.recorded - b.recorded;
            });
            console.log(moments[0]);
            console.log(moments[1000]);
            console.log(moments[2000]);
            console.log(moments[3000]);
            console.log(moments[4000]);
            console.log(moments[5000]);
            console.log(moments[6000]);
            console.log(moments[7000]);
            console.log(moments[8000]);
            console.log(moments[9000]);
            console.log(moments[9999]);
        });
    });
});




