/**
 * Created by Mitchell on 4/20/2017.
 */

var moment = require('moment');

const DATE_FORMAT = "YYYYMMDD"; // Date format for (de)serialization

/**
 * Custom error class I created to allow catching parsing errors specifically
 */
class ParserError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ParserError';
    }
}

/**
 * Rounds a number to the nearest 2 decimal places (rounds up), and converts it to a string
 * Ex. 1 => "1.00", 2.3 => "2.30", 1.2345 => "1.23", 1.515 => "1.52", 0 => "0.00"
 * @param {Number} num - The number to round
 * @returns {string} - The formatted string
 */
function roundedString(num) {
    return (Math.round(num * 100) / 100).toFixed(2);
}

/**
 * Rounds a number to 2 decimal places (rounds up)
 * @param {Number} num - The number to round
 * @returns {Number} - The rounded number
 */
function roundCurrency(num) {
    return Math.round(num * 100) / 100;
}

/**
 * Deserializes a StockRecord line into a StockRecord. Originally I thought of implementing this in the
 * StockRecord class, but then it would have to know about its subclasses, which felt dirty.
 * @param {String} line - The line to deserialize
 * @returns {StockRecord}
 */
function parseRecordLine(line) {
    if (line && typeof line === 'string') {
        var split_data = line.split(',');
        if (split_data.length > 3) {
            return parseRecord(...split_data);
        } else {
            throw new ParserError(`Bad line format: ${line}`)
        }
    } else if (line === "") {
        throw new ParserError("Empty line");
    } else {
        throw new ParserError("Bad line");
    }
}

/**
 * Parses a bunch of strings that define a StockRecord
 * @param {String} type_code
 * @param {String} employee_id
 * @param {String} date_string
 * @param {String} extras
 * @returns {StockRecord}
 */
function parseRecord(type_code, employee_id, date_string, ...extras) {
    var moment_recorded = moment(date_string, DATE_FORMAT); // Parse the date according to the date format
    if (!moment_recorded.isValid()) {
        // February 30th is not a day
        throw new ParserError(`Bad date string: ${date_string}`);
    } else {
        if (type_code == "VEST") {
            return new VestStockRecord(employee_id, moment_recorded, parseFloat(extras[0]), parseFloat(extras[1]))
        } else if (type_code == "PERF") {
            return new PerfStockRecord(employee_id, moment_recorded, parseFloat(extras[0]))
        } else if (type_code == "SALE") {
            return new SaleStockRecord(employee_id, moment_recorded, parseFloat(extras[0]), parseFloat(extras[1]))
        } else {
            throw new ParserError(`Bad type code: ${type_code}`)
        }
    }
}

/**
 * A StockPriceRecord specifies a price for a stock at a given time. Used to calculate earnings and sales
 */
class StockPriceRecord {
    /**
     * Creates a StockPriceRecord
     * @param {String|Moment} moment_recorded - The point in time
     * @param {Number} market_price - The price of the stock
     */
    constructor(moment_recorded, market_price) {
        this._market_price = market_price;
        this._moment_recorded = moment(moment_recorded); // moment(moment('2014-01-01')) === moment('2014-01-01')
        if (isNaN(this._market_price)) {
            throw new Error(`Invalid market price, expected number: ${market_price}`);
        }
        if (!this._moment_recorded.isValid()) {
            throw new Error(`Invalid moment: ${moment_recorded}`);
        }
    }

    /**
     * Returns the point in time
     * @returns {Moment}
     */
    get moment_recorded() {
        return this._moment_recorded;
    }

    /**
     * Returns the price
     * @returns {Number}
     */
    get market_price() {
        return this._market_price;
    }

    /**
     * Serialize the StockPriceRecord into a String
     * @returns {String}
     */
    toString() {
        return `${this.moment_recorded.format("YYYYMMDD")},${this.market_price}`
    }

    /**
     * Deserializes a String into a StockPriceRecord
     * @param line
     * @returns {StockPriceRecord}
     */
    static parse(line) {
        // Format accepts strings like "20140228,1", "19900101,.5", or "19950101,0.5"
        var validation_regex = /^[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9],([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)$/;
        if (!validation_regex.test(line)) {
            throw new ParserError(`Invalid format, expected format like '20170125,12.50', received: '${line}'`);
        } else {
            var split_data = line.split(',');
            return new StockPriceRecord(moment(split_data[0]), parseFloat(split_data[1]));
        }
    }
}

/**
 * Immutable
 * Represents a record of a change in a stock for a particular user, originally the employee was going to be
 * represented as a true Employee, but then that created a circular reference, and also broke the immutability of
 * the object.
 * NOTE: To implement a subclass of this, you must specify this._priority (see StockRecord#sort_order), and
 * implement StockRecord#applyToPortfolio
 */
class StockRecord {
    /**
     * Creates a StockRecord
     * @param {String} type_code - The type of record (ex. "VEST")
     * @param {String} employee_id - The employee ID
     * @param {Moment|String} moment_recorded - The timestamp of the entry
     */
    constructor(type_code, employee_id, moment_recorded) {
        this._type_code = type_code;
        this._employee_id = employee_id;
        this._moment_recorded = moment(moment_recorded); // moment(moment('2014-01-01')) === moment('2014-01-01')
        if (!this._moment_recorded.isValid()) {
            throw new Error(`Invalid moment: ${moment_recorded}`);
        }
    }

    /**
     * Returns type code.
     * @returns {String}
     */
    get type_code() {
        return this._type_code;
    }

    /**
     * Returns the employee ID
     * @returns {String}
     */
    get employee_id() {
        return this._employee_id;
    }

    /**
     * Returns the time the record was generated, as a Moment
     * @returns {Moment}
     */
    get moment_recorded() {
        return this._moment_recorded;
    }

    /**
     * Sorts by time, secondary sort by this._priority
     * NOTE: this._priority must be implemented as a number between 0 and 1000, lower numbers are higher priority
     * @returns {Number}
     */
    get sort_order() {
        if (typeof this._priority === "undefined") {
            throw new Error("Subclasses of StockRecord must have a priority, lower priorities are ordered first")
        } else if (this._priority > 1000) {
            throw new Error("Subclasses of StockRecord must have a priority value under 1000");
        }
        // Gives the unix timestamp in milliseconds, adds what should be a tiny priority number,
        // so that if a record comes in a second later, it will not be misordered.
        return this._moment_recorded.valueOf() + this._priority;
    }

    /**
     * Used in calculating the aggregate variables of a portfolio, implemented here, so that StockRecords
     * can have arbitrary effects on Portfolios
     * NOTE: This must be implemented in subclasses
     * @param {Portfolio} portfolio - The Portfolio to affect
     */
    applyToPortfolio(portfolio) {
        throw new Error("Not implemented");
    }

    /**
     * Serializes the StockRecord
     * @returns {String}
     */
    toString() {
        return `${this.type_code},${this._employee_id},${this.moment_recorded.format(DATE_FORMAT)}`
    }
}

/**
 * Immutable
 * Represents a VEST record.
 */
class VestStockRecord extends StockRecord {
    /**
     * Creates a VEST record
     * @param {String} employee_id - The employee ID
     * @param {Moment} moment_recorded - The timestamp of the entry
     * @param {Number} amount - The amount of shares
     * @param {Number} grant_price - The price per share
     */
    constructor(employee_id, moment_recorded, amount, grant_price) {
        super("VEST", employee_id, moment_recorded);
        this._priority = 100;
        if (typeof amount === "number" && !isNaN(amount)) {
            this._amount = amount;
        } else {
            throw new ParserError("Amount is not a number, received: ${amount}");
        }
        if (typeof grant_price === "number" && !isNaN(grant_price)) {
            this._grant_price = grant_price;
        } else {
            throw new ParserError("Amount is not a number, received: ${amount}");
        }
    }

    /**
     * Return the number of shares
     * @returns {Number}
     */
    get amount() {
        return this._amount;
    }

    /**
     * Returns the price per share
     * @returns {Number}
     */
    get grant_price() {
        return this._grant_price;
    }

    /**
     * Used in calculating the aggregate variables of a portfolio.
     * @param {Portfolio} portfolio - The Portfolio to update
     */
    applyToPortfolio(portfolio) {
        portfolio.vestStock(this.amount, this.grant_price);
    }

    /**
     * Serializes the VestStockRecord
     * @returns {String}
     */
    toString() {
        return `${this.type_code},${this._employee_id},${this.moment_recorded.format(DATE_FORMAT)},${this.amount},${roundedString(this.grant_price)}`
    }
}


/**
 * Immutable
 * Represents a PERF record.
 */
class PerfStockRecord extends StockRecord {
    /**
     * Creates a PERF record
     * @param employee_id - The employee ID
     * @param moment_recorded - The timestamp of the entry
     * @param multiplier - The amount to multiple quantities of shares by
     */
    constructor(employee_id, moment_recorded, multiplier) {
        super("PERF", employee_id, moment_recorded);
        this._priority = 300; // Must be processed after VEST and SALE records for correctness
        this._multiplier = multiplier;
    }

    /**
     * Return the multiplier
     * @returns {Number}
     */
    get multiplier() {
        return this._multiplier;
    }

    /**
     * Used in calculating the aggregate variables of a portfolio.
     * @param {Portfolio} portfolio - The Portfolio to update
     */
    applyToPortfolio(portfolio) {
        portfolio.multiplyStock(this.multiplier);
    }

    /**
     * Serializes the PerfStockRecord
     * @returns {String}
     */
    toString() {
        return `${this.type_code},${this._employee_id},${this.moment_recorded.format(DATE_FORMAT)},${this.multiplier}`
    }
}

/**
 * Immutable
 * Represents a SALE stock record
 */
class SaleStockRecord extends StockRecord {
    /**
     * Creates a VEST record
     * @param employee_id - The employee ID
     * @param moment_recorded - The timestamp of the entry
     * @param amount - The amount of shares
     * @param market_price - The price per share
     */
    constructor(employee_id, moment_recorded, amount, market_price) {
        super("SALE", employee_id, moment_recorded);
        this._priority = 200; // Should be processed after VEST records but before PERF records
        this._amount = amount;
        this._market_price = market_price;
    }

    /**
     * Retrieve the amount of shares
     * @returns {Number}
     */
    get amount() {
        return this._amount;
    }

    /**
     * Retrieve the price per share
     * @returns {Number}
     */
    get market_price() {
        return this._market_price;
    }

    /**
     * Used in calculating the aggregate variables of a portfolio
     * @param {Portfolio} portfolio - The Portfolio to update
     */
    applyToPortfolio(portfolio) {
        portfolio.sellStock(this.amount, this.market_price);
    }

    /**
     * Serializes the SaleStockRecord
     * @returns {String}
     */
    toString() {
        return `${this.type_code},${this._employee_id},${this.moment_recorded.format(DATE_FORMAT)},${this.amount},${roundedString(this.market_price)}`
    }
}

// I originally had each type of record in its own file, but it was annoying with all the moving parts to move between
// the files, and be sure that I'd updated every subclass. As a result, they're all here now.
module.exports = {
    roundedString,
    roundCurrency,
    ParserError,
    parseRecordLine,
    parseRecord,
    StockPriceRecord,
    StockRecord,
    VestStockRecord,
    PerfStockRecord,
    SaleStockRecord,
}
