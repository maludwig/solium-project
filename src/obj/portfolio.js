/**
 * Created by Mitchell on 4/20/2017.
 */

var moment = require('moment');
var stocks = require('../obj/stocks');
var SortedList = require('../obj/sorted-list');
var Holding = require('../obj/holding');

function holdingSortFunction (holding_a, holding_b) {
    return holding_a.price - holding_b.price;
}
function recordSortFunction (stock_record_a, stock_record_b) {
    return stock_record_a.sort_order - stock_record_b.sort_order;
};


class Portfolio {
    constructor() {
        this._stock_records = new SortedList(recordSortFunction);
        this._holdings = new SortedList(holdingSortFunction);

        // Aggregation variables for memoization
        this._stock_quantity = 0;
        this._value_invested = 0;
        this._value_purchased = 0;
        this._value_sold = 0;

        this._calculation_until = moment();
        this._dirty = false;
    }

    get stock_records() {
        return this._stock_records;
    }

    get holdings() {
        return this._holdings;
    }

    get stock_quantity() {
        if (this._dirty) this.recalculateAggregations();
        return this._stock_quantity;
    }

    get value_purchased() {
        if (this._dirty) this.recalculateAggregations();
        return this._value_purchased;
    }

    get value_vested() {
        if (this._dirty) this.recalculateAggregations();
        return this._value_invested;
    }

    get value_sold() {
        if (this._dirty) this.recalculateAggregations();
        return this._value_sold;
    }

    get value_earned() {
        return this.value_sold - this.value_purchased;
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

    vestStock(quantity, price) {
        this._stock_quantity += quantity;
        this._value_invested += quantity * price;
        this._holdings.insert(new Holding(quantity, price))
    }

    sellStock(quantity, price) {
        var quantity_remaning = quantity;
        var quantity_to_remove;
        if (quantity > this._stock_quantity) {
            throw new Error("You cannot sell more stock than you have");
        }
        this._stock_quantity -= quantity;
        this._value_sold += quantity * price;
        // Sell cheapest stock first, loop through holdings until you've sold enough.
        for(var holding of this._holdings) {
            if (quantity_remaning < 0) {
                break;
            } else {
                quantity_to_remove = Math.min(holding.quantity, quantity_remaning);
                this._value_invested -= quantity_to_remove * holding.price;
                this._value_purchased += quantity_to_remove * holding.price;
                holding.quantity -= quantity_to_remove;
                quantity_remaning -= quantity_to_remove;
            }
        }
    }

    multiplyStock(multiplier) {
        this._stock_quantity *= multiplier;
        this._value_invested *= multiplier;
        for(var holding of this._holdings) {
            holding.quantity *= multiplier;
        }
    }

    addRecord(stock_record) {
        if (stock_record instanceof stocks.StockRecord) {
            this._stock_records.insert(stock_record);
            this._dirty = true;
        } else {
            throw new Error("Input not a StockRecord");
        }
    }

    recalculateAggregations() {
        // Reset aggregation variables
        this._stock_quantity = 0;
        this._value_purchased = 0;
        this._value_invested = 0;
        this._value_sold = 0;
        this._holdings = new SortedList(holdingSortFunction);

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
        this._dirty = false; // Denote that aggregation variables are correct
    }

    valueAtPrice(stock_price_record) {
        this.calculate_until = stock_price_record.moment_recorded;
        return this.stock_quantity * stock_price_record.market_price;
    }

    earningsIfSoldAtPrice(stock_price_record) {
        this.calculate_until = stock_price_record.moment_recorded;
        return (this.stock_quantity * stock_price_record.market_price) - this.value_vested;
    }
}


module.exports = Portfolio