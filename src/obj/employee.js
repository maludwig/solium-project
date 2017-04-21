/**
 * Created by Mitchell on 4/20/2017.
 */
var stocks = require("./stocks");
var Portfolio = require("./portfolio");

class Employee {
    constructor(employee_id) {
        if(typeof employee_id === "string") {
            this._employee_id = employee_id;
        } else {
            throw new Error(`Bad employee ID, expected number, received: ${employee_id}`);
        }
        this._portfolio = new Portfolio();
    }
    get id () {
        return this._employee_id;
    }
    get stock_records () {
        return this._portfolio.stock_records;
    }
    addRecordToPorfilio(stock_record) {
        if(stock_record instanceof stocks.StockRecord) {
            if(stock_record._employee_id === this._employee_id) {
                this._portfolio.addRecord(stock_record);
            } else {
                throw new Error("Employee ID does not match Stock Record");
            }
        } else {
            throw new Error("Input not a StockRecord");
        }
    }
    calculateValueAtPrice(stock_price_record) {
        return this._portfolio.valueAtPrice(stock_price_record);
    }
    calculateEarningsAtPrice(stock_price_record) {
        return this._portfolio.earningsAtPrice(stock_price_record);
    }
    calculateSoldValueUntilMoment(calculate_until) {
        this._portfolio.calculate_until = calculate_until;
        return this._portfolio.value_sold;
    }
}

module.exports = Employee;
