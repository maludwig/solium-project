/**
 * Created by Mitchell on 4/20/2017.
 */

var moment = require('moment');
var record = require('./stocks/record');

const DATE_FORMAT = "YYYYMMDD";

class ParserError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ParserError';
    }
}

function parse_record_line(line) {
    if(line && typeof line === 'string') {
        var split_data = line.split(',');
        if (split_data.length > 3) {
            parse_record(...split_data);
        } else {
            throw new ParserError(`Bad line format: ${line}`)
        }
    } else if (line === "") {
        throw new ParserError("Empty line");
    } else {
        throw new ParserError("Bad line");
    }
}
function parse_record (type_code, employee_id, date_string, ...extras) {
    var date_moment = moment(date_string,DATE_FORMAT);
    if (!date_moment.isValid()) {
        throw new ParserError(`Bad date string: ${date_string}`);
    } else {
        console.log(date_moment.toISOString());
        if (type_code == "VEST") {
            console.log("It's a vest!");
        } else if (type_code == "PERF") {
            console.log("Great performance!");
        } else if (type_code == "SALE") {
            console.log("MAKE GREAT DEALS!");
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
    get marketPrice() {
        return this._market_price;
    }
    toString() {
        return `${this.momentRecorded.format("YYYYMMDD")},${this.marketPrice}`
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
    get typeCode() {
        return this._type_code;
    }
    get employeeId() {
        return this._employee_id;
    }
    get momentRecorded() {
        return this._moment_recorded;
    }
    toString() {
        return `${this.typeCode},${this.employeeId},${this.momentRecorded.format(DATE_FORMAT)}`
    }
}

class VestStockRecord extends StockRecord {
    constructor(type_code, employee_id, moment_recorded, amount, price) {
        super(type_code,employee_id,moment_recorded);
        this._amount = amount;
        this._price = price;
    }
    get amount() {
        return this._amount;
    }
    get price() {
        return this._price;
    }
    netGain(stock_price_record) {
        var net_gain;
        if (stock_price_record.momentRecorded < this.momentRecorded) {
            return 0;
        } else {
            net_gain = this.amount * (stock_price_record.marketPrice - this.price);
            if (net_gain < 0) {
                return 0; // Any row with a negative value can by ignored
            } else {
                return net_gain;
            }
        }
    }
    toString() {
        return `${this.typeCode},${this.employeeId},${this.momentRecorded.format(DATE_FORMAT)}`
    }
}

module.exports = {
    StockRecord,
}

parse_record_line('VEST,002B,20120102,1000,0.45');
parse_record_line('PERF,001B,20130102,1.5');
parse_record_line('SALE,001B,20120402,500,1.00');
parse_record_line('SALE,001B,20140228,500,1.00');
