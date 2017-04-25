/**
 * Created by Mitchell on 4/24/2017.
 */

var expect = require('chai').expect;
var Employee = require('../obj/employee');
var EmployeeDirectory = require('../obj/employee-directory');

describe("Employee Directory tests", function () {
    describe("Basic functionality", function () {
        it("Starts off empty", function () {
            var directory = new EmployeeDirectory();
            expect(directory.employees).to.deep.equal({});
        });
        it("creates and gets employees nicely", function () {
            var directory = new EmployeeDirectory();
            expect(directory.employees).to.deep.equal({});
            expect(directory.getEmployee("Mitch")).to.be.undefined;
            expect(directory.createOrGetEmployee("Mitch") instanceof Employee).to.be.true;
            expect(directory.getEmployee("Mitch") instanceof Employee).to.be.true;
        });
    });
});


