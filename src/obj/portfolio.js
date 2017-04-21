/**
 * Created by Mitchell on 4/20/2017.
 */

var moment = require('moment');
var stocks = require('../obj/stocks');

class Portfolio {
    constructor() {
        this._stock_quantity = 0;
        this._stock_records = [];
        this._value_purchased = 0;
        this._value_sold = 0;
        this._calculation_until = moment();
        this._dirty = false;
    }

    get stock_records() {
        return this._stock_records;
    }

    get stock_quantity() {
        if (this._dirty) this.recalculate();
        return this._stock_quantity;
    }

    get value_purchased() {
        if (this._dirty) this.recalculate();
        return this._value_purchased;
    }

    get value_sold() {
        if (this._dirty) this.recalculate();
        return this._value_sold;
    }

    get calculate_until() {
        return this._calculation_until;
    }

    set calculate_until(value) {
        var moment_value = moment(value);
        if(!moment_value.isSame(this._calculation_until)) {
            this._calculation_until = moment_value;
            this._dirty = true;
        }
    }

    buyStock(quantity, price) {
        this._stock_quantity += quantity;
        this._value_purchased += quantity * price;
    }

    sellStock(quantity, price) {
        this._stock_quantity -= quantity;
        this._value_sold += quantity * price;
    }

    addRecord(stock_record) {
        if (stock_record instanceof stocks.StockRecord) {
            this._insertRecordSorted(stock_record);
        } else {
            throw new Error("Input not a StockRecord");
        }
    }

    _insertRecordSorted(stock_record) {
        var min = 0;
        var max = this._stock_records.length;
        var range;
        var index;
        while (min != max) {
            range = max - min
            index = Math.floor(min + (range / 2));
            if (stock_record.moment_recorded.isBefore(this._stock_records[index].moment_recorded)) {
                max = index;
            } else if (stock_record.moment_recorded.isAfter(this._stock_records[index].moment_recorded)) {
                min = index + 1;
            } else {
                min = index;
                max = index;
            }
        }
        // Insert record at desired index;
        this._stock_records.splice(min, 0, stock_record);
        this._dirty = true;
    }

    recalculate() {
        // Reset aggregation variables
        this._stock_quantity = 0;
        this._value_purchased = 0;
        this._value_sold = 0;

        // Recalculate aggregation variables
        for (var stock_record of this._stock_records) {
            // Stop calculating after the edge
            if (stock_record.moment_recorded.isAfter(this.calculate_until)) {
                break;
            } else {
                // Allow the record to affect the portfolio in arbitrary ways
                stock_record.applyToPortfolio(this);
            }
        }
        this._dirty = false;
    }

    valueAtPrice(stock_price_record) {
        this.calculate_until = stock_price_record.moment_recorded;
        if (this._dirty) this.recalculate();
        return this._stock_quantity * stock_price_record.market_price;
    }

    earningsAtPrice(stock_price_record) {
        return this.valueAtPrice(stock_price_record) - this.value_purchased;
    }
}


module.exports = Portfolio