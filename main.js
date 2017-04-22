/*
Author: Mitchell Ludwig
Date Created: 2017-04-19
 */

// console.log("See README.md for instructions on how to install and run this project");
var stocks = require('./src/obj/stocks');
var EmployeeDirectory = require('./src/obj/employee-directory');

var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});
var entries_remaining;
var employee_directory = new EmployeeDirectory();
var has_sales = false;

function read_first_line (line) {
    entries_remaining = parseInt(line, 10);
    rl.removeListener('line', read_first_line);
    rl.on('line', read_middle_line);
}
function read_middle_line (line) {
    var stock_record = stocks.parseRecordLine(line);
    var employee = employee_directory.createOrGetEmployee(stock_record._employee_id);
    employee.addRecordToPorfilio(stock_record);
    if(stock_record instanceof stocks.SaleStockRecord) {
        has_sales = true;
    }
    entries_remaining--;
    if (entries_remaining == 0) {
        rl.removeListener('line', read_middle_line);
        rl.on('line', read_last_line);
    }
}
function read_last_line (line) {
    var stock_price_record = stocks.StockPriceRecord.parse(line);
    var employees = employee_directory.employees;
    var output_lines = [];
    for (var employee_id in employees) {
        if (employees.hasOwnProperty(employee_id)) {
            var employee = employees[employee_id];
            var earnings = employee.calculatePotentialEarningsAtPrice(stock_price_record);
            if (has_sales) {
                var sales = employee.calculateEarningsUntil(stock_price_record.moment_recorded);
                output_lines.push(`${employee_id},${stocks.roundedString(earnings)},${stocks.roundedString(sales)}`);
            } else {
                output_lines.push(`${employee_id},${stocks.roundedString(earnings)}`);
            }
        }
    }
    for(var i = 0; i < output_lines.length - 1; i++) {
        process.stdout.write(output_lines[i] + "\r\n");
    }
    process.stdout.write(output_lines[output_lines.length - 1]);
}

rl.on('line', read_first_line);
// rl.on('close', function(){
//     console.log(`## close ##`);
// })