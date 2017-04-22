/**
 * Created by Mitchell on 4/21/2017.
 */
var expect = require('chai').expect;
var moment = require('moment');
var stocks = require('../obj/stocks');
var employees = require('../obj/employee');
var Portfolio = require('../obj/portfolio');

describe("Portfolio tests", function () {
    describe("Basic portfolio", function () {
        it("will start with no records, sales, or purchases", function () {
            var portfolio = new Portfolio();
            expect(portfolio.stock_quantity).to.equal(0);
            expect(portfolio.stock_records.length).to.equal(0);
            expect(portfolio.value_purchased).to.equal(0);
            expect(portfolio.value_sold).to.equal(0);
        });
        it("can add vest records", function () {
            var portfolio = new Portfolio();
            portfolio.addRecord(new stocks.VestStockRecord("Mitch", '2012-01-01', 100, 0.5));
            expect(portfolio.stock_quantity).to.equal(100);
            expect(portfolio.stock_records.length).to.equal(1);
            expect(portfolio.value_purchased).to.equal(0);
            expect(portfolio.value_vested).to.equal(50);
            expect(portfolio.value_sold).to.equal(0);
            portfolio.addRecord(new stocks.VestStockRecord("Mitch", '2013-01-01', 100, 12.50));
            expect(portfolio.stock_quantity).to.equal(200);
            expect(portfolio.stock_records.length).to.equal(2);
            expect(portfolio.value_purchased).to.equal(0);
            expect(portfolio.value_vested).to.equal(1300);
            expect(portfolio.value_sold).to.equal(0);
        });
        it("can add vest and sale and perf records accurately", function () {
            var portfolio = new Portfolio();
            portfolio.addRecord(new stocks.VestStockRecord("Mitch", '2012-01-01', 100, 0.5));
            expect(portfolio.stock_quantity).to.equal(100);
            expect(portfolio.stock_records.length).to.equal(1);
            expect(portfolio.value_purchased).to.equal(0);
            expect(portfolio.value_vested).to.equal(50);
            expect(portfolio.value_sold).to.equal(0);
            portfolio.addRecord(new stocks.VestStockRecord("Mitch", '2011-01-01', 100, 12.50));
            expect(portfolio.stock_quantity).to.equal(200);
            expect(portfolio.stock_records.length).to.equal(2);
            expect(portfolio.value_purchased).to.equal(0);
            expect(portfolio.value_vested).to.equal(1300);
            expect(portfolio.value_sold).to.equal(0);
            portfolio.addRecord(new stocks.SaleStockRecord("Mitch", '2013-01-01', 50, 20));
            expect(portfolio.stock_quantity).to.equal(150);
            expect(portfolio.stock_records.length).to.equal(3);
            expect(portfolio.value_purchased).to.equal(25);
            expect(portfolio.value_vested).to.equal((100*12.50)+((100-50)*0.5));
            expect(portfolio.value_sold).to.equal(1000);
            portfolio.addRecord(new stocks.PerfStockRecord("Mitch", '2011-01-01', 1.5));
            expect(portfolio.stock_quantity).to.equal((100*1.5)+(100-50));
            expect(portfolio.value_purchased).to.equal(25);
            expect(portfolio.value_vested).to.equal((100*1.5*12.50)+((100-50)*0.5));
            expect(portfolio.value_sold).to.equal(1000);
            portfolio.addRecord(new stocks.PerfStockRecord("Mitch", '2010-12-01', 1.5));
            expect(portfolio.stock_quantity).to.equal((100*1.5)+(100-50));
            expect(portfolio.value_purchased).to.equal(25);
            expect(portfolio.value_vested).to.equal((100*1.5*12.50)+((100-50)*0.5));
            expect(portfolio.value_sold).to.equal(1000);
        });
        it("keeps the records in order", function () {
            var portfolio = new Portfolio();
            portfolio.addRecord(new stocks.VestStockRecord("Mitch", '2012-01-01', 100, 0.5));
            expect(portfolio.stock_records.length).to.equal(1);
            expect(portfolio.stock_records[0].moment_recorded.isSame('2012-01-01')).to.be.true;
            portfolio.addRecord(new stocks.VestStockRecord("Mitch", '2011-01-01', 100, 12.50));
            expect(portfolio.stock_records.length).to.equal(2);
            expect(portfolio.stock_records[0].moment_recorded.isSame('2011-01-01')).to.be.true;
            expect(portfolio.stock_records[1].moment_recorded.isSame('2012-01-01')).to.be.true;
            portfolio.addRecord(new stocks.SaleStockRecord("Mitch", '2013-01-01', 50, 20));
            expect(portfolio.stock_records.length).to.equal(3);
            expect(portfolio.stock_records[0].moment_recorded.isSame('2011-01-01')).to.be.true;
            expect(portfolio.stock_records[1].moment_recorded.isSame('2012-01-01')).to.be.true;
            expect(portfolio.stock_records[2].moment_recorded.isSame('2013-01-01')).to.be.true;
            portfolio.addRecord(new stocks.PerfStockRecord("Mitch", '2011-01-01', 1.5));
            expect(portfolio.stock_records.length).to.equal(4);
            expect(portfolio.stock_records[0].moment_recorded.isSame('2011-01-01')).to.be.true;
            expect(portfolio.stock_records[1].moment_recorded.isSame('2011-01-01')).to.be.true;
            expect(portfolio.stock_records[2].moment_recorded.isSame('2012-01-01')).to.be.true;
            expect(portfolio.stock_records[3].moment_recorded.isSame('2013-01-01')).to.be.true;
            portfolio.addRecord(new stocks.PerfStockRecord("Mitch", '2010-12-01', 1.5));
            expect(portfolio.stock_records.length).to.equal(5);
            expect(portfolio.stock_records[0].moment_recorded.isSame('2010-12-01')).to.be.true;
            expect(portfolio.stock_records[1].moment_recorded.isSame('2011-01-01')).to.be.true;
            expect(portfolio.stock_records[2].moment_recorded.isSame('2011-01-01')).to.be.true;
            expect(portfolio.stock_records[3].moment_recorded.isSame('2012-01-01')).to.be.true;
            expect(portfolio.stock_records[4].moment_recorded.isSame('2013-01-01')).to.be.true;
        });
        it("sells the cheapest vests first", function () {
            var portfolio = new Portfolio();
            var stock_price_record = new stocks.StockPriceRecord(moment(), 250);
            portfolio.addRecord(new stocks.parseRecordLine("VEST,001B,20120102,4,100"));
            expect(portfolio.stock_quantity).to.equal(4);
            expect(portfolio.value_vested).to.equal(400);
            expect(portfolio.value_purchased).to.equal(0);
            expect(portfolio.value_sold).to.equal(0);
            expect(portfolio.value_earned).to.equal(0);
            expect(portfolio.earningsIfSoldAtPrice(stock_price_record)).to.equal((4*250)-(4*100));
            portfolio.addRecord(new stocks.parseRecordLine("VEST,001B,20120102,4,0.50"));
            expect(portfolio.stock_quantity).to.equal(8);
            expect(portfolio.value_vested).to.equal((4*100)+(4*0.5));
            expect(portfolio.value_purchased).to.equal(0);
            expect(portfolio.value_sold).to.equal(0);
            expect(portfolio.value_earned).to.equal(0);
            expect(portfolio.earningsIfSoldAtPrice(stock_price_record)).to.equal((8*250)-((4*100)+(4*0.5)));
            portfolio.addRecord(new stocks.parseRecordLine("SALE,001B,20120402,2,300"));
            expect(portfolio.stock_quantity).to.equal(6);
            expect(portfolio.value_vested).to.equal((4*100)+(2*0.5));
            expect(portfolio.value_purchased).to.equal(1);
            expect(portfolio.value_sold).to.equal(600);
            expect(portfolio.value_earned).to.equal(599);
            expect(portfolio.earningsIfSoldAtPrice(stock_price_record)).to.equal((6*250)-((4*100)+(2*0.5)));
        });
        it("earnings function properly", function () {
            var portfolio = new Portfolio();
            var stock_price_record = new stocks.StockPriceRecord(moment(), 250);
            portfolio.addRecord(new stocks.parseRecordLine("VEST,001B,20120102,4,100"));
            expect(portfolio.stock_quantity).to.equal(4);
            expect(portfolio.value_vested).to.equal(400);
            expect(portfolio.value_purchased).to.equal(0);
            expect(portfolio.value_sold).to.equal(0);
            expect(portfolio.value_earned).to.equal(0);
            expect(portfolio.earningsIfSoldAtPrice(stock_price_record)).to.equal((4*250)-(4*100));
            portfolio.addRecord(new stocks.parseRecordLine("SALE,001B,20120102,2,300"));
            expect(portfolio.stock_quantity).to.equal(2);
            expect(portfolio.value_vested).to.equal(200);
            expect(portfolio.value_purchased).to.equal(200);
            expect(portfolio.value_sold).to.equal(600);
            expect(portfolio.value_earned).to.equal((2*300)-(2*100));
            expect(portfolio.earningsIfSoldAtPrice(stock_price_record)).to.equal((2*250)-(2*100));
            portfolio.addRecord(new stocks.parseRecordLine("PERF,001B,20130102,2"));
            expect(portfolio.stock_quantity).to.equal(4);
            expect(portfolio.value_vested).to.equal(400);
            expect(portfolio.value_purchased).to.equal(200);
            expect(portfolio.value_sold).to.equal(600);
            expect(portfolio.value_earned).to.equal((2*300)-(2*100));
            expect(portfolio.earningsIfSoldAtPrice(stock_price_record)).to.equal((4*250)-(4*100));
        });






    });
    describe("Massive portfolio", function () {
        var massive_portfolio = new Portfolio();
        var now_unix_timestamp = moment().unix();
        var count = 10000;
        var quantity = 10;
        var price = 1;

        it("can create a massive portfolio quickly", function () {
            for (var i = 0; i < count; i++) {
                massive_portfolio.addRecord(new stocks.VestStockRecord("Mitch", moment.unix(Math.random() * now_unix_timestamp), quantity, price));
            }

        });
        it("accurately sorted", function () {
            for (var i = 0; i < count - 1; i++) {
                expect(massive_portfolio.stock_records[i].moment_recorded.isSameOrBefore(massive_portfolio.stock_records[i + 1].moment_recorded)).to.be.true;
            }
        });
        it("accurately produces data", function () {
            expect(massive_portfolio.stock_quantity).to.equal(count * quantity);
            expect(massive_portfolio.stock_records.length).to.equal(count);
            expect(massive_portfolio.value_purchased).to.equal(0);
            expect(massive_portfolio.value_vested).to.equal(count * quantity * price);
            expect(massive_portfolio.value_sold).to.equal(0);
            expect(massive_portfolio.value_earned).to.equal(0);
        });
        it("accurately caches data for quick retrieval", function () {
            this.timeout(3);
            expect(massive_portfolio.stock_quantity).to.equal(count * quantity);
            expect(massive_portfolio.stock_records.length).to.equal(count);
            expect(massive_portfolio.value_purchased).to.equal(0);
            expect(massive_portfolio.value_vested).to.equal(count * quantity * price);
            expect(massive_portfolio.value_sold).to.equal(0);
            expect(massive_portfolio.value_earned).to.equal(0);
        });
        it("updates data if a Perf record is added", function () {
            // Add a Perf record halfway between Jan 1 1970 and now, halfway thru the portfolio.
            massive_portfolio.addRecord(new stocks.PerfStockRecord("Mitch", moment.unix(now_unix_timestamp / 2), 2));
            // There should now be around 1.5x as many stocks in the portfolio,
            // 1x the original stocks should be in the first half, the other 0.5x in the second half of the timeline
            // so it should be between 1.4x and 1.6x
            expect(massive_portfolio.stock_quantity).to.be.above(count * quantity * 1.4);
            expect(massive_portfolio.stock_quantity).to.be.below(count * quantity * 1.6);
            expect(massive_portfolio.stock_records.length).to.equal(count + 1);
            expect(massive_portfolio.value_vested).to.be.above(count * quantity * price * 1.4);
            expect(massive_portfolio.value_vested).to.be.below(count * quantity * price * 1.6);
            expect(massive_portfolio.value_sold).to.equal(0);
        });
        it("still accurately caches data for quick retrieval", function () {
            this.timeout(3);
            expect(massive_portfolio.stock_quantity).to.be.above(count * quantity * 1.4);
            expect(massive_portfolio.stock_quantity).to.be.below(count * quantity * 1.6);
            expect(massive_portfolio.stock_records.length).to.equal(count + 1);
            expect(massive_portfolio.value_vested).to.be.above(count * quantity * price * 1.4);
            expect(massive_portfolio.value_vested).to.be.below(count * quantity * price * 1.6);
            expect(massive_portfolio.value_sold).to.equal(0);
        });
        it("updates data if the calculation moment is changes", function () {
            massive_portfolio.calculate_until = moment.unix(now_unix_timestamp / 4);
            // If we haven't hit that big perf record yet, it will not have multiplied our investments
            // so we should have only about 1/4 of our original.
            expect(massive_portfolio.stock_quantity).to.be.above(count * quantity * 0.2);
            expect(massive_portfolio.stock_quantity).to.be.below(count * quantity * 0.3);
            expect(massive_portfolio.stock_records.length).to.equal(count + 1);
            expect(massive_portfolio.value_vested).to.be.above(count * quantity * price * 0.2);
            expect(massive_portfolio.value_vested).to.be.below(count * quantity * price * 0.3);
            expect(massive_portfolio.value_sold).to.equal(0);
        });
        it("still accurately caches data for quick retrieval", function () {
            this.timeout(3);
            expect(massive_portfolio.stock_quantity).to.be.above(count * quantity * 0.2);
            expect(massive_portfolio.stock_quantity).to.be.below(count * quantity * 0.3);
            expect(massive_portfolio.stock_records.length).to.equal(count + 1);
            expect(massive_portfolio.value_vested).to.be.above(count * quantity * price * 0.2);
            expect(massive_portfolio.value_vested).to.be.below(count * quantity * price * 0.3);
            expect(massive_portfolio.value_sold).to.equal(0);
        });
    });
});




