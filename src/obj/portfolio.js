/**
 * Created by Mitchell on 4/20/2017.
 */

var moment = require('moment');
var stocks = require('../obj/stocks');
var SortedList = require('../obj/sorted-list');
var Holding = require('../obj/holding');

/**
 * Comparison function, compares Holdings by their price, used to sort lowest to highest.
 * Holdings are sold in order of this algorithm, but the order was not specified in the problem outline.
 * @param {Holding} holding_a
 * @param {Holding} holding_b
 * @returns {Number} - See Array.sort() comparison function documentation
 * @see {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/sort?v=control}
 */
function comparePrices(holding_a, holding_b) {
    return holding_a.price - holding_b.price;
}

/**
 * Comparison function, compares StockRecords by their sort_order property, used to sort earliest to
 * latest, with a secondary ordering by priority, see StockRecord.sort_order documentation
 * @param {StockRecord} stock_record_a
 * @param {StockRecord} stock_record_b
 * @returns {Number} - See Array.sort() comparison function documentation
 * @see {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/sort?v=control}
 */
function compareSortOrder(stock_record_a, stock_record_b) {
    return stock_record_a.sort_order - stock_record_b.sort_order;
}

/**
 * Represents an entity's holdings, technically in all stocks, but we've only implemented a single type of stock.
 * If we wanted to represent individual separate stocks, we would probably name this something else, and
 * use one instances of it to represent each different stock held by the entity.
 */
class Portfolio {
    /**
     * Creates an empty Portfolio
     */
    constructor() {
        this._stock_records = new SortedList(compareSortOrder); // All StockRecords, ordered by time and priority
        this._inventory = new SortedList(comparePrices); // All shares held, ordered by price

        // Aggregation variables for memoization, operations took unacceptably long without this
        this._share_quantity = 0;  // Amount of shares currently held
        this._value_vested = 0;    // Value of all shares currently held
        this._value_purchased = 0; // Value of all shares purchased [to be sold] so far
        this._value_sold = 0;      // Value of all sales so far

        this._calculation_until = moment(); // By default, calculate to the current day
        this._dirty = false; // Initially, the aggregation variables are correct
    }

    /**
     * Retrieves all StockRecords in a SortedList
     * @returns {SortedList}
     */
    get stock_records() {
        return this._stock_records;
    }

    /**
     * Returns all shares held, in a SortedList
     * @returns {SortedList}
     */
    get holdings() {
        return this._inventory;
    }

    /**
     * MEMOIZED: Calculates number of shares currently held
     * @returns {Number}
     */
    get stock_quantity() {
        if (this._dirty) this.recalculateAggregations();
        return this._share_quantity;
    }

    /**
     * MEMOIZED: Calculates value of all shares purchased
     * @returns {Number}
     */
    get value_purchased() {
        if (this._dirty) this.recalculateAggregations();
        return this._value_purchased;
    }

    /**
     * MEMOIZED: Calculates value of all shares vested
     * @returns {Number}
     */
    get value_vested() {
        if (this._dirty) this.recalculateAggregations();
        return this._value_vested;
    }

    /**
     * MEMOIZED: Calculates value of all shares sold
     * @returns {Number}
     */
    get value_sold() {
        if (this._dirty) this.recalculateAggregations();
        return this._value_sold;
    }

    /**
     * MEMOIZED: Calculates value of all earnings
     * @returns {Number}
     */
    get value_earned() {
        return this.value_sold - this.value_purchased;
    }

    /**
     * Returns the moment to run the calculations up to
     * @returns {Moment}
     */
    get calculate_until() {
        return this._calculation_until;
    }

    /**
     * Sets the moment to run the calculations up to
     * @param {Moment} value
     */
    set calculate_until(value) {
        var moment_value = moment(value);
        // Many operations will set the moment to the same value, resulting in unnecessary recalculations
        if (!moment_value.isSame(this._calculation_until)) {
            this._calculation_until = moment_value;
            this._dirty = true;
        }
    }

    /**
     * Add vested stock to our holdings, called by StockRecords#apply to update the inventory of the Portfolio
     * @param {Number} quantity - Amount of shares to add
     * @param {Number} price - Cost per share
     */
    vestStock(quantity, price) {
        this._share_quantity += quantity;
        this._value_vested += quantity * price;
        this._inventory.insert(new Holding(quantity, price))
    }

    /**
     * Simulates selling a stock, sells the cheapest stock first, for the best short-term gain.
     * Sell order is determined by the sort order of this._inventory
     * @param {Number} quantity - The amount of shares to sell
     * @param {Number} price - The price of each share
     */
    sellStock(quantity, price) {
        var quantity_remaning = quantity;
        var quantity_to_remove_from_this_holding; // My longest variable name
        if (quantity > this._share_quantity) {
            throw new Error("You cannot sell more stock than you have");
        }
        this._share_quantity -= quantity;
        this._value_sold += quantity * price;
        // Sell cheapest stock first, loop through holdings until you've sold enough.
        for (var holding of this._inventory) {
            if (quantity_remaning < 0) {
                // No need to keep looping if we're done finding shares to sell
                break;
            } else {
                quantity_to_remove_from_this_holding = Math.min(holding.quantity, quantity_remaning);
                this._value_vested -= quantity_to_remove_from_this_holding * holding.price;
                this._value_purchased += quantity_to_remove_from_this_holding * holding.price;
                quantity_remaning -= quantity_to_remove_from_this_holding;
                holding.quantity -= quantity_to_remove_from_this_holding;
                // TODO: MAYBE. For efficiency of this program, we could delete empty holdings
                // Tested, marginal efficiency gains, unacceptable increase in efficiency
            }
        }
    }

    /**
     * Used to increase all of the stock held by some multiplier
     * @param {Number} multiplier - The number to multiply by
     */
    multiplyStock(multiplier) {
        this._share_quantity *= multiplier;
        this._value_vested *= multiplier;
        for (var holding of this._inventory) {
            holding.quantity *= multiplier;
        }
    }

    /**
     * Adds a record to the SortedList of records, maintaining sort order. Does not immediately recalculate
     * for efficiency. Aggregate variables are calculated lazily and memoized for efficiency
     * @param {StockRecord} stock_record - The record to add
     */
    addRecord(stock_record) {
        if (stock_record instanceof stocks.StockRecord) {
            this._stock_records.insert(stock_record);
            this._dirty = true;
        } else {
            throw new Error("Input not a StockRecord");
        }
    }

    /**
     * Recalculates all of the memoized variables, iterating through all of the StockRecords
     */
    recalculateAggregations() {
        // Reset aggregation variables
        this._share_quantity = 0;
        this._value_purchased = 0;
        this._value_vested = 0;
        this._value_sold = 0;
        this._inventory = new SortedList(comparePrices);

        // Recalculate aggregation variables
        for (var stock_record of this._stock_records) {
            if (stock_record.moment_recorded.isAfter(this.calculate_until)) {
                // Stop calculating after the edge
                break;
            } else {
                // Allow the record to affect the portfolio in arbitrary ways
                stock_record.applyToPortfolio(this);
            }
        }
        this._dirty = false; // Denote that aggregation variables are correct
    }

    /**
     * MEMOIZED: Calculates the value of remaining shares, if sold at a specific time and price
     * @param {StockPriceRecord} stock_price_record
     * @returns {Number} - Value of remaining shares
     */
    valueAtPrice(stock_price_record) {
        this.calculate_until = stock_price_record.moment_recorded;
        return this.stock_quantity * stock_price_record.market_price;
    }

    /**
     * MEMOIZED: Calculates the earnings if we were to sell all remaining shares at the specific time and price
     * @param {StockPriceRecord} stock_price_record
     * @returns {Number} - Earnings from selling remaining shares
     */
    earningsIfSoldAtPrice(stock_price_record) {
        var total_sales = 0;
        this.calculate_until = stock_price_record.moment_recorded;
        if (this._dirty) this.recalculateAggregations();
        // return (this.stock_quantity * stock_price_record.market_price) - this.value_vested;
        for (var holding of this._inventory) {
            if(holding.price < stock_price_record.market_price) {
                total_sales += holding.quantity * (stock_price_record.market_price - holding.price);
            }
        }
        return stocks.roundCurrency(total_sales);
    }
}

module.exports = Portfolio