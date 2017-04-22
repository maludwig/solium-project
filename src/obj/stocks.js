/**
 * Created by Mitchell on 4/20/2017.
 */

var moment = require('moment');

const DATE_FORMAT = "YYYYMMDD";

class ParserError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ParserError';
    }
}

function roundedString(num) {
    var power = Math.pow(10, 2);
    return (Math.round(num * power) / power).toFixed(2);
}
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
function parseRecord(type_code, employee_id, date_string, ...extras) {
    var moment_recorded = moment(date_string, DATE_FORMAT);
    if (!moment_recorded.isValid()) {
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

class StockPriceRecord {
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

    get moment_recorded() {
        return this._moment_recorded;
    }

    get market_price() {
        return this._market_price;
    }

    toString() {
        return `${this.moment_recorded.format("YYYYMMDD")},${this.market_price}`
    }

    static parse(line) {
        var validation_regex = /^[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9],[0-9]+\.[0-9]+$/;
        if (!validation_regex.test(line)) {
            throw new ParserError(`Invalid format, expected '20170125,12.50', received: '${line}'`);
        } else {
            var split_data = line.split(',');
            return new StockPriceRecord(moment(split_data[0]), parseFloat(split_data[1]));
        }
    }
}

class StockRecord {
    constructor(type_code, employee_id, moment_recorded) {
        this._type_code = type_code;
        this._employee_id = employee_id;
        this._moment_recorded = moment(moment_recorded); // moment(moment('2014-01-01')) === moment('2014-01-01')
        if (!this._moment_recorded.isValid()) {
            throw new Error(`Invalid moment: ${moment_recorded}`);
        }
    }

    get type_code() {
        return this._type_code;
    }

    get employee_id() {
        return this._employee_id;
    }

    get moment_recorded() {
        return this._moment_recorded;
    }

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

    applyToPortfolio(portfolio) {
        throw new Error("Not implemented");
    }

    toString() {
        return `${this.type_code},${this._employee_id},${this.moment_recorded.format(DATE_FORMAT)}`
    }
}

class VestStockRecord extends StockRecord {
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

    get amount() {
        return this._amount;
    }

    get grant_price() {
        return this._grant_price;
    }

    applyToPortfolio(portfolio) {
        portfolio.vestStock(this.amount, this.grant_price);
    }

    toString() {
        return `${this.type_code},${this._employee_id},${this.moment_recorded.format(DATE_FORMAT)},${this.amount},${roundedString(this.grant_price)}`
    }
}
class PerfStockRecord extends StockRecord {
    constructor(employee_id, moment_recorded, multiplier) {
        super("PERF", employee_id, moment_recorded);
        this._priority = 300;
        this._multiplier = multiplier;
    }

    get multiplier() {
        return this._multiplier;
    }

    applyToPortfolio(portfolio) {
        portfolio.multiplyStock(this.multiplier);
    //     for (var stock_record of portfolio.stock_records) {
    //         if (stock_record.moment_recorded.isSameOrBefore(this.moment_recorded)) {
    //             if (stock_record instanceof VestStockRecord) {
    //                 portfolio.vestStock(stock_record.amount * (this.multiplier - 1), stock_record.grant_price)
    //             } else if (stock_record instanceof SaleStockRecord) {
    //                 portfolio.removeStock(stock_record.amount * (this.multiplier - 1));
    //             }
    //         }
    //     }
    }

    toString() {
        return `${this.type_code},${this._employee_id},${this.moment_recorded.format(DATE_FORMAT)},${this.multiplier}`
    }
}
class SaleStockRecord extends StockRecord {
    constructor(employee_id, moment_recorded, amount, market_price) {
        super("SALE", employee_id, moment_recorded);
        this._priority = 200;
        this._amount = amount;
        this._market_price = market_price;
    }

    get amount() {
        return this._amount;
    }

    get market_price() {
        return this._market_price;
    }

    applyToPortfolio(portfolio) {
        portfolio.sellStock(this.amount, this.market_price);
    }

    toString() {
        return `${this.type_code},${this._employee_id},${this.moment_recorded.format(DATE_FORMAT)},${this.amount},${roundedString(this.market_price)}`
    }
}

module.exports = {
    roundedString,
    ParserError,
    parseRecordLine,
    parseRecord,
    StockPriceRecord,
    StockRecord,
    VestStockRecord,
    PerfStockRecord,
    SaleStockRecord,
}
