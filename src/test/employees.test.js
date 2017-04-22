/**
 * Created by Mitchell on 4/20/2017.
 */
var expect = require('chai').expect;
var moment = require('moment');
var stocks = require('../obj/stocks');
var Employee = require('../obj/employee');

describe("Employee tests", function () {
    describe("Test Employee Class", function () {
        it("Creates an Employee properly", function () {
            var mitch = new Employee("Mitchell");
            var stock_price_record = new stocks.StockPriceRecord(moment(),1);
            expect(mitch._employee_id).to.equal("Mitchell");
            expect(mitch.stock_records.length).to.equal(0);
            expect(mitch.calculateValueAtPrice(stock_price_record)).to.equal(0);
        });
        it("Adds a good record successfully", function () {
            var mitch = new Employee("Mitchell");
            var vest_stock_record = new stocks.VestStockRecord("Mitchell",moment('2012-01-01'),100,5);
            var stock_price_record = new stocks.StockPriceRecord(moment(),9);
            var value = 0;
            expect(mitch._employee_id).to.equal("Mitchell");
            expect(mitch.stock_records.length).to.equal(0);
            value = mitch.calculateValueAtPrice(stock_price_record);
            expect(value).to.equal(0);
            mitch.addRecordToPorfilio(vest_stock_record);
            expect(mitch.stock_records.length).to.equal(1);
            value = mitch.calculateValueAtPrice(stock_price_record);
            expect(value).to.equal(900);
            value = mitch.calculatePotentialEarningsAtPrice(stock_price_record);
            expect(value).to.equal(400);
        });
    });
});




