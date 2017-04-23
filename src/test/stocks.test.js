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
            }).to.throw(stocks.Error, 'Bad line'); // Testing for ParserError specifically does not work in ES5-
        });
        it("Errors out when the line is an empty string", function () {
            expect(function () {
                stocks.parseRecordLine("");
            }).to.throw(stocks.Error, "Empty line");
        });
        it("Errors out when the line doesn't have enough comma separated values", function () {
            expect(function () {
                stocks.parseRecordLine("VEST,00E");
            }).to.throw(stocks.Error, /Bad line format/);
        });
        it("Errors out when the line does not have a valid code", function () {
            expect(function () {
                stocks.parseRecordLine("SHIRT,00E,20140101,1000,0.5");
            }).to.throw(stocks.Error, /Bad type code/);
        });
        it("Errors out when the line is invalid", function () {
            expect(() => stocks.parseRecordLine("VEST,002B,20120102,1000,KEVIN")).to.throw(stocks.Error);
            expect(() => stocks.parseRecordLine("VEST,002B,20120102,KEVIN,1")).to.throw(stocks.Error);
            expect(() => stocks.parseRecordLine("VEST,002B,20120102,KEVIN,KEVIN")).to.throw(stocks.Error);
            expect(() => stocks.parseRecordLine("VEST,002B,20130229,1000,1")).to.throw(stocks.Error);
        });
        it("Correctly works with dates", function() {
            var record;
            var now = moment();
            var todayString = now.format("YYYYMMDD");
            record = stocks.parseRecordLine("VEST,002B,20120102,1000,0.45");
            expect(record.toString()).to.equal("VEST,002B,20120102,1000,0.45");
            record = new stocks.VestStockRecord("Mitch", moment(), 1, 2);
            expect(record.toString()).to.equal(`VEST,Mitch,${todayString},1,2.00`);
            record = new stocks.VestStockRecord("Mitch", "20120101", 1, 2);
            expect(record.toString()).to.equal(`VEST,Mitch,20120101,1,2.00`);
            expect(() => stocks.parseRecordLine("VEST,002B,20130229,1000,1")).to.throw(stocks.Error);
            expect(() => {new stocks.VestStockRecord("Mitch", "20130229", 1, 2)}).to.throw(stocks.Error);
        });
        it("Returns a valid VestStockRecord when a valid line is passed in", function () {
            var record = stocks.parseRecordLine("VEST,002B,20120102,1000,0.45");
            expect(record instanceof stocks.VestStockRecord).to.be.true;
            expect(record.type_code).to.equal("VEST");
            expect(record._employee_id).to.equal("002B");
            expect(record.moment_recorded.isSame(moment("2012-01-02", "YYYY-MM-DD"))).to.be.true;
            expect(record.amount).to.equal(1000);
            expect(record.grant_price).to.equal(0.45);
            expect(record.toString()).to.equal("VEST,002B,20120102,1000,0.45");
        });
        it("Returns a valid PerfStockRecord when a valid line is passed in", function () {
            var record = stocks.parseRecordLine("PERF,001B,20130102,1.5");
            expect(record instanceof stocks.PerfStockRecord).to.be.true;
            expect(record.type_code).to.equal("PERF");
            expect(record._employee_id).to.equal("001B");
            expect(record.moment_recorded.isSame(moment("2013-01-02", "YYYY-MM-DD"))).to.be.true;
            expect(record.multiplier).to.equal(1.5);
            expect(record.toString()).to.equal("PERF,001B,20130102,1.5");
        });
        it("Returns a valid SaleStockRecord when a valid line is passed in", function () {
            var record = stocks.parseRecordLine("SALE,001B,20120402,500,1.00");
            expect(record instanceof stocks.SaleStockRecord).to.be.true;
            expect(record.type_code).to.equal("SALE");
            expect(record._employee_id).to.equal("001B");
            expect(record.moment_recorded.isSame(moment("2012-04-02", "YYYY-MM-DD"))).to.be.true;
            expect(record.amount).to.equal(500);
            expect(record.market_price).to.equal(1.00);
            expect(record.toString()).to.equal("SALE,001B,20120402,500,1.00");
        });
        it("Parses all of the sample records correctly", function () {
            function testParsing(line) {
                expect(stocks.parseRecordLine(line).toString()).to.equal(line);
            }

            var testLines = [
                "PERF,001B,20130102,1.5",
                "PERF,002B,20130102,1.5",
                "SALE,001B,20120402,500,1.00",
                "VEST,001B,20120101,1000,0.45",
                "VEST,001B,20120102,1000,0.45",
                "VEST,001B,20130101,1500,0.50",
                "VEST,002B,20120101,1500,0.45",
                "VEST,002B,20120102,1000,0.45",
                "VEST,002B,20130101,1000,0.50",
                "VEST,003B,20120102,1000,0.45",
                "VEST,003B,20130101,1000,0.50",
            ];
            for (var line of testLines) {
                testParsing(line);
            }
        });
        it("Rounds numbers correctly", function () {
            expect(stocks.roundedString(1)).to.equal("1.00");
            expect(stocks.roundedString(1.5)).to.equal("1.50");
            expect(stocks.roundedString(11111)).to.equal("11111.00");
            expect(stocks.roundedString(1.2345)).to.equal("1.23");
            expect(stocks.roundedString(1.5555555)).to.equal("1.56");
            expect(stocks.roundedString(1.235)).to.equal("1.24");
            expect(stocks.roundedString(0)).to.equal("0.00");
            expect(stocks.roundedString(-0.5)).to.equal("-0.50");
            expect(stocks.roundedString(-0.005)).to.equal("0.00");
            expect(stocks.roundedString(-0.005001)).to.equal("-0.01");
        });
        it("Deserializes StockPriceRecords correctly", function () {
            var stock_price_record;
            stock_price_record = stocks.StockPriceRecord.parse("20140101,1");
            expect(stock_price_record.market_price).to.equal(1);
            expect(stock_price_record.moment_recorded.isSame(moment('2014-01-01'))).to.be.true;
            stock_price_record = stocks.StockPriceRecord.parse("20140101,1.");
            expect(stock_price_record.market_price).to.equal(1);
            expect(stock_price_record.moment_recorded.isSame(moment('2014-01-01'))).to.be.true;
            stock_price_record = stocks.StockPriceRecord.parse("20140101,1.1");
            expect(stock_price_record.market_price).to.equal(1.1);
            expect(stock_price_record.moment_recorded.isSame(moment('2014-01-01'))).to.be.true;
            stock_price_record = stocks.StockPriceRecord.parse("20140101,.1");
            expect(stock_price_record.market_price).to.equal(0.1);
            expect(stock_price_record.moment_recorded.isSame(moment('2014-01-01'))).to.be.true;
            stock_price_record = stocks.StockPriceRecord.parse("20120229,12345.67");
            expect(stock_price_record.market_price).to.equal(12345.67);
            expect(stock_price_record.moment_recorded.isSame(moment('2012-02-29'))).to.be.true;
            stock_price_record = stocks.StockPriceRecord.parse("20241231,12345.67");
            expect(stock_price_record.market_price).to.equal(12345.67);
            expect(stock_price_record.moment_recorded.isSame(moment('2024-12-31'))).to.be.true;
            stock_price_record = stocks.StockPriceRecord.parse("19120229,12345.67");
            expect(stock_price_record.market_price).to.equal(12345.67);
            expect(stock_price_record.moment_recorded.isSame(moment('1912-02-29'))).to.be.true;
            expect(() => stocks.StockPriceRecord.parse("20140229,12345.67")).to.throw(Error);
            expect(() => stocks.StockPriceRecord.parse("19130229,12345.67")).to.throw(Error);
            expect(() => stocks.StockPriceRecord.parse("19130229,")).to.throw(Error);
            expect(() => stocks.StockPriceRecord.parse("19130229,a")).to.throw(Error);
            expect(() => stocks.StockPriceRecord.parse("19130229,BILLCLINTONISARAPISTINFOWARS.COM")).to.throw(Error);
        })
    });
});




