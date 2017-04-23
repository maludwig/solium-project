/**
 * Created by Mitchell on 4/20/2017.
 */
var stocks = require("./stocks");
var Portfolio = require("./portfolio");

/**
 * Represents an employee who may vest and sell stocks, and get performance bonuses
 */
class Employee {
    /**
     * Creates an employee
     * @param {string} employee_id - Everybody needs a name
     */
    constructor(employee_id) {
        if(typeof employee_id === "string") {
            this._employee_id = employee_id;
        } else {
            throw new Error(`Bad employee ID, expected number, received: ${employee_id}`);
        }
        this._portfolio = new Portfolio();
    }

    /**
     * Retrieve an Employee ID
     * @returns {string|*} - Employee ID
     */
    get id () {
        return this._employee_id;
    }

    /**
     * Retrieve all stock records
     * @returns {StockRecord[]} - StockRecords as a SortedList
     */
    get stock_records () {
        return this._portfolio.stock_records;
    }

    /**
     * Retrieve the employee's portfolio
     * @returns {Portfolio} - The portfolio
     */
    get portfolio () {
        return this._portfolio;
    }

    /**
     * Adds a StockRecord to the employee's portfolio
     * @param {StockRecord} stock_record - The StockRecord to add
     */
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

    /**
     * Calculate the value of all of the employee's holdings, if they were sold at the specific price and time
     * @param {StockPriceRecord} stock_price_record - The specific price and time
     * @returns {Number} - The value of all the employee's holdings
     */
    calculateValueAtPrice(stock_price_record) {
        return this._portfolio.valueAtPrice(stock_price_record);
    }

    /**
     * Calculate the earnings of all of the employee's holdings at a specific time,
     * if they purchased all of the stocks at the vest price, and then sold them at the specific price and time
     * @param {StockPriceRecord} stock_price_record - The specific price and time
     * @returns {Number} - The potential earnings
     */
    calculatePotentialEarningsAtPrice(stock_price_record) {
        return this._portfolio.earningsIfSoldAtPrice(stock_price_record);
    }

    /**
     * Calculate how much the person has earned from stocks that have been sold up to a specific moment (inclusive)
     * @param {Moment} calculate_until - The moment to calculate to
     * @returns {Number} - The earnings
     */
    calculateEarningsUntil(calculate_until) {
        this._portfolio.calculate_until = calculate_until;
        return this._portfolio.value_earned;
    }
}

module.exports = Employee;