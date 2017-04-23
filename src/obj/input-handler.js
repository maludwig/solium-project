/**
 * Created by Mitchell on 4/23/2017.
 */

var stocks = require('./src/obj/stocks');
var stream = require('stream');
var readline = require('readline');
var EmployeeDirectory = require('./src/obj/employee-directory');

/**
 * Handles StockRecords passed in, and outputs the correct output when it is passed a StockPriceRecord
 */
class InputHandler {
    constructor (callback_when_done) {
        this.employee_directory = new EmployeeDirectory();
        this._has_sales = false;
        this._stage = "FIRST_LINE";
        this._callback_when_done = callback_when_done;
    }
    ingestLine(line) {
        if (this._stage === "FIRST_LINE") {
            this.ingestFirstLine(line);
            this._stage = "MIDDLE_LINES";
        } else if (this._stage === "MIDDLE_LINES") {
            this.ingestMiddleLine(line);
            this._records_remaining--;
            if(this._records_remaining === 0) {
                this._stage = "LAST_LINE";
            }
        } else {
            this._stage = "DONE";
            this._callback_when_done(this.ingestLastLine(line));
        }
    }
    ingestFirstLine(line) {
        this._records_remaining = parseFloat(line);
        if(isNaN(this._records_remaining)) {
            throw new Error("First line is not a number");
        }
    }
    ingestMiddleLine(line) {
        var stock_record, employee;
        stock_record = stocks.parseRecordLine(line);
        employee = this.employee_directory.createOrGetEmployee(stock_record.employee_id);
        employee.addRecordToPorfilio(stock_record);
        if(stock_record instanceof stocks.SaleStockRecord) {
            has_sales = true;
        }
    }
    ingestLastLine(line) {
        var stock_price_record = stocks.StockPriceRecord.parse(line);
        var employees = this.employee_directory.employees;
        var output_lines = [];
        var employee;
        var earnings;
        var sales;
        for (var employee_id in employees) {
            if (employees.hasOwnProperty(employee_id)) {
                employee = employees[employee_id];
                earnings = employee.calculatePotentialEarningsAtPrice(stock_price_record);
                if (has_sales) {
                    sales = employee.calculateEarningsUntil(stock_price_record.moment_recorded);
                    output_lines.push(`${employee_id},${stocks.roundedString(earnings)},${stocks.roundedString(sales)}`);
                } else {
                    output_lines.push(`${employee_id},${stocks.roundedString(earnings)}`);
                }
            }
        }
        return output_lines.join("\r\n");
    }
}

/**
 * Handles a Readable stream of StockRecords, starting with an item count, and ending with a StockPriceRecord
 * Outputs to a Writable stream, the required employee records
 */
function handleStream(input_stream, output_stream) {
    var input_handler;
    if (!(input_stream instanceof stream.Readable)) {
        throw new Error("I need an actual stream to read from")
    }
    if (!(output_stream instanceof stream.Writable)) {
        throw new Error("I need an actual stream to write to");
    }
    this._line_stream = readline.createInterface({
        input: this._input_stream,
        output: this._output_stream,
        terminal: false
    });
    input_handler = new InputHandler(function (output) {
        output_stream.write(output);
    });
    this._line_stream.on('line', input_handler.ingestLine);
}

module.exports = {
    handleStream,
    InputHandler,
}