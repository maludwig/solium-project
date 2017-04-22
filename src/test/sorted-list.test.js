/**
 * Created by Mitchell on 4/22/2017.
 */
var SortedList = require('../obj/sorted-list');
var moment = require('moment');
var expect = require('chai').expect;

describe("Sorted List", function () {
    describe("Basic functions", function () {
        it("Lists are initially empty", function () {
            var sorted_list = new SortedList();
            expect(sorted_list.length).to.equal(0);
        });
        it("Inserting items works and keeps them sorted", function () {
            var sorted_list = new SortedList();
            expect(sorted_list.length).to.equal(0);
            sorted_list.insert(3);
            expect(sorted_list.length).to.equal(1);
            sorted_list.insert(4);
            expect(sorted_list.length).to.equal(2);
            sorted_list.insert(2);
            expect(sorted_list.length).to.equal(3);
            sorted_list.insert(3);
            expect(sorted_list.length).to.equal(4);
            expect(sorted_list[0]).to.equal(2);
            expect(sorted_list[1]).to.equal(3);
            expect(sorted_list[2]).to.equal(3);
            expect(sorted_list[3]).to.equal(4);
        });
        it("can do a reverse sort", function () {
            var sorted_list = new SortedList();
            sorted_list._sort_function = function (a, b) {
                return b - a;
            }
            expect(sorted_list.length).to.equal(0);
            sorted_list.insert(3);
            expect(sorted_list.length).to.equal(1);
            sorted_list.insert(4);
            expect(sorted_list.length).to.equal(2);
            sorted_list.insert(2);
            expect(sorted_list.length).to.equal(3);
            sorted_list.insert(3);
            expect(sorted_list.length).to.equal(4);
            expect(sorted_list[0]).to.equal(4);
            expect(sorted_list[1]).to.equal(3);
            expect(sorted_list[2]).to.equal(3);
            expect(sorted_list[3]).to.equal(2);
        });
        it("correctly sorts a list of moments", function () {
            var sorted_list = new SortedList(function (a, b) {
                return a.diff(b);
            });
            expect(sorted_list.length).to.equal(0);
            sorted_list.insert(moment('2012-01-01'));
            expect(sorted_list.length).to.equal(1);
            sorted_list.insert(moment('2011-01-01'));
            expect(sorted_list.length).to.equal(2);
            sorted_list.insert(moment('2013-01-01'));
            expect(sorted_list.length).to.equal(3);
            sorted_list.insert(moment('2012-01-01'));
            expect(sorted_list.length).to.equal(4);
            expect(sorted_list[0].isSame(moment('2011-01-01'))).to.be.true;
            expect(sorted_list[1].isSame(moment('2012-01-01'))).to.be.true;
            expect(sorted_list[2].isSame(moment('2012-01-01'))).to.be.true;
            expect(sorted_list[3].isSame(moment('2013-01-01'))).to.be.true;
        });
    });
});