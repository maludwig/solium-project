/**
 * Created by Mitchell on 4/20/2017.
 */
var expect = require('chai').expect;
var moment = require('moment');
var stocks = require('../obj/stocks');

describe("Stocks tests", function () {
    describe("parseRecordLine function", function () {
        it("Errors out when the line is not provided", function () {
            expect(function () {
                stocks.parseRecordLine();
            }).to.throw(stocks.ParserError);
        });
        it("Errors out when the line is an empty string", function () {
            expect(function () {
                stocks.parseRecordLine("");
            }).to.throw(stocks.ParserError);
        });
        it("Errors out when the line doesn't have enough comma separated values", function () {
            expect(function () {
                stocks.parseRecordLine("VEST,00E");
            }).to.throw(stocks.ParserError);
        });
        it("Errors out when the line does not have a valid code", function () {
            expect(function () {
                stocks.parseRecordLine("SHIRT,00E,20140101,1000,0.5");
            }).to.throw(stocks.ParserError);
        });
        it("Errors out when the line is invalid", function () {
            expect(function () {
                stocks.parseRecordLine("VEST,002B,20120102,1000,KEVIN");
            }).to.throw(stocks.ParserError);
            expect(function () {
                stocks.parseRecordLine("VEST,002B,20120102,KEVIN,1");
            }).to.throw(stocks.ParserError);
            expect(function () {
                stocks.parseRecordLine("VEST,002B,20120102,KEVIN,KEVIN");
            }).to.throw(stocks.ParserError);
        });
        it("Returns a valid VestStockRecord when a valid line is passed in", function () {
            var record = stocks.parseRecordLine("VEST,002B,20120102,1000,0.45");
            expect(record instanceof stocks.VestStockRecord).to.be.true;
            expect(record.type_code).to.equal("VEST");
            expect(record.employee_id).to.equal("002B");
            expect(record.moment_recorded.isSame(moment("2012-01-02","YYYY-MM-DD"))).to.be.true;
            expect(record.amount).to.equal(1000);
            expect(record.grant_price).to.equal(0.45);
            expect(record.toString()).to.equal("VEST,002B,20120102,1000,0.45");
        });
        it("Returns a valid PerfStockRecord when a valid line is passed in", function () {
            var record = stocks.parseRecordLine("PERF,001B,20130102,1.5");
            expect(record instanceof stocks.PerfStockRecord).to.be.true;
            expect(record.type_code).to.equal("PERF");
            expect(record.employee_id).to.equal("001B");
            expect(record.moment_recorded.isSame(moment("2013-01-02","YYYY-MM-DD"))).to.be.true;
            expect(record.multiplier).to.equal(1.5);
            expect(record.toString()).to.equal("PERF,001B,20130102,1.5");
        });
        it("Returns a valid SaleStockRecord when a valid line is passed in", function () {
            var record = stocks.parseRecordLine("SALE,001B,20120402,500,1.00");
            expect(record instanceof stocks.SaleStockRecord).to.be.true;
            expect(record.type_code).to.equal("SALE");
            expect(record.employee_id).to.equal("001B");
            expect(record.moment_recorded.isSame(moment("2012-04-02","YYYY-MM-DD"))).to.be.true;
            expect(record.amount).to.equal(500);
            expect(record.market_price).to.equal(1.00);
            expect(record.toString()).to.equal("SALE,001B,20120402,500,1.00");
        });
    });
});



