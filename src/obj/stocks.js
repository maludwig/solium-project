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
    if(line && typeof line === 'string') {
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
function parseRecord (type_code, employee_id, date_string, ...extras) {
    var moment_recorded = moment(date_string,DATE_FORMAT);
    if (!moment_recorded.isValid()) {
        throw new ParserError(`Bad date string: ${date_string}`);
    } else {
        console.log(moment_recorded.toISOString());
        if (type_code == "VEST") {
            console.log("It's a vest!");
            return new VestStockRecord(type_code,employee_id,moment_recorded,parseFloat(extras[0]),parseFloat(extras[1]))
        } else if (type_code == "PERF") {
            console.log("Great performance!");
            return new PerfStockRecord(type_code,employee_id,moment_recorded,parseFloat(extras[0]))
        } else if (type_code == "SALE") {
            console.log("MAKE GREAT DEALS!");
            return new SaleStockRecord(type_code,employee_id,moment_recorded,parseFloat(extras[0]),parseFloat(extras[1]))
        } else {
            throw new ParserError(`Bad type code: ${type_code}`)
        }
    }
}

class StockPriceRecord {
    constructor(moment_recorded, market_price) {
        this._market_price = market_price;
        this._moment_recorded = moment(moment_recorded); // moment(moment('2014-01-01')) === moment('2014-01-01')
        if(isNaN(this._market_price)) {
            throw new Error(`Invalid market price, expected number: ${market_price}`);
        }
        if(! this._moment_recorded.isValid()) {
            throw new Error(`Invalid moment: ${moment_recorded}`);
        }
    }
    get momentRecorded() {
        return this._moment_recorded;
    }
    get market_price() {
        return this._market_price;
    }
    toString() {
        return `${this.momentRecorded.format("YYYYMMDD")},${this.market_price}`
    }
    static parse(line) {
        var validation_regex = /^[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9],[0-9]+\.[0-9]+$/;
        if( ! validation_regex.test(line)) {
            throw new ParserError(`Invalid format, expected '20170125,12.50', received: '${line}'`);
        } else {
            var split_data = line.split(',');
            return new StockPriceRecord(moment(split_data[0], parseFloat(split_data[1])));
        }
    }
}

class StockRecord {
    constructor(type_code, employee_id, moment_recorded) {
        this._type_code = type_code;
        this._employee_id = employee_id;
        this._moment_recorded = moment(moment_recorded); // moment(moment('2014-01-01')) === moment('2014-01-01')
        if(! this._moment_recorded.isValid()) {
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
    toString() {
        return `${this.type_code},${this.employee_id},${this.moment_recorded.format(DATE_FORMAT)}`
    }
}

class VestStockRecord extends StockRecord {
    constructor(type_code, employee_id, moment_recorded, amount, grant_price) {
        super(type_code,employee_id,moment_recorded);
        if(typeof amount === "number" && !isNaN(amount)) {
            this._amount = amount;
        } else {
            throw new ParserError("Amount is not a number, received: ${amount}");
        }
        if(typeof grant_price === "number" && !isNaN(grant_price)) {
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
    netGain(stock_price_record) {
        var net_gain;
        if (stock_price_record.moment_recorded < this.moment_recorded) {
            return 0;
        } else {
            net_gain = this.amount * (stock_price_record.market_price - this.grant_price);
            if (net_gain < 0) {
                return 0; // Any row with a negative value can by ignored
            } else {
                return net_gain;
            }
        }
    }
    toString() {
        return `${this.type_code},${this.employee_id},${this.moment_recorded.format(DATE_FORMAT)},${this.amount},${roundedString(this.grant_price)}`
    }
}
class PerfStockRecord extends StockRecord {
    constructor(type_code, employee_id, moment_recorded, multiplier) {
        super(type_code,employee_id,moment_recorded);
        this._multiplier = multiplier;
    }
    get multiplier() {
        return this._multiplier;
    }
    toString() {
        return `${this.type_code},${this.employee_id},${this.moment_recorded.format(DATE_FORMAT)},${this.multiplier}`
    }
}
class SaleStockRecord extends StockRecord {
    constructor(type_code, employee_id, moment_recorded, amount, market_price) {
        super(type_code,employee_id,moment_recorded);
        this._amount = amount;
        this._market_price = market_price;
    }
    get amount() {
        return this._amount;
    }
    get market_price() {
        return this._market_price;
    }
    toString() {
        return `${this.type_code},${this.employee_id},${this.moment_recorded.format(DATE_FORMAT)},${this.amount},${roundedString(this.market_price)}`
    }
}

module.exports = {
    ParserError,
    parseRecordLine,
    parseRecord,
    StockRecord,
    VestStockRecord,
    PerfStockRecord,
    SaleStockRecord,
}
