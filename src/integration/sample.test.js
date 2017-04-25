/**
 * Created by Mitchell on 4/20/2017.
 */
/**
 * Created by Mitchell on 4/19/2017.
 */
var expect = require('chai').expect;
var spawn = require('child_process').spawn;
var fs = require('fs');

var stocks = require('../obj/stocks');
var Portfolio = require('../obj/portfolio');
var Employee = require('../obj/employee');
var EmployeeDirectory = require('../obj/employee-directory');

/**
 * Creates a test function for testing a given sample file
 * @param {String} input_file_path - File path to input
 * @param {String} expected_output_file_path - File path to output
 * @returns {Function}
 */
function generateHandler (input_file_path, expected_output_file_path) {
    return function (done) {
        var test_process = spawn('node', ['main.js']);
        var full_stdout_data = '';
        var full_stderr_data = '';
        test_process.stdout.on('data', (data) => {
            full_stdout_data += data;
        });
        test_process.stderr.on('data', (data) => {
            throw new Error(`STDERR written to: ${data}`);
        });
        fs.createReadStream(input_file_path).pipe(test_process.stdin);
        test_process.on('close', (code) => {
            var verify_file_contents = fs.readFileSync(expected_output_file_path, { encoding : 'utf8'});
            fs.writeFileSync("boo.def", full_stdout_data);
            console.log(`Ended with ${code}\nSTDOUT:\n${full_stdout_data}\n\nSTDERR:\n${full_stderr_data}\n\n`);
            expect(full_stdout_data).to.equal(verify_file_contents);
            done();
        });
    }
}
describe("Integration test to confirm that sample inputs produce correct output", function () {
    describe("First sample", function () {
        it("Works with the date set to 20140101", generateHandler('templates/sample1-20140101-in.def', 'templates/sample1-20140101-out.def'));
        it("Works with the date set to 20120614", generateHandler('templates/sample1-20120615-in.def', 'templates/sample1-20120615-out.def'));
    });
    describe("Second sample", function () {
        it("Works with the date set to 20140101", generateHandler('templates/sample2-20140101-in.def', 'templates/sample2-20140101-out.def'));
        it("Works with the date set to 20130101", generateHandler('templates/sample2-20130101-in.def', 'templates/sample2-20130101-out.def'));
    });
    describe("Third sample", function () {
        it("Works with the date set to 20140101", generateHandler('templates/sample3-20140101-in.def', 'templates/sample3-20140101-out.def'));
        it("Works with the date set to 20130101", generateHandler('templates/sample3-20130101-in.def', 'templates/sample3-20130101-out.def'));
    });
    describe("Unicode works", function () {
        it("correctly handles Nords", generateHandler('templates/unicode1-in.def', 'templates/unicode1-out.def'));
        it("correctly handles the secret Russian accounts, encrypted with city names", generateHandler('templates/unicode2-in.def', 'templates/unicode2-out.def'));
    });
    describe("Third sample in detail", function () {
        it("can do sample3, with vest, sale, and perf records correctly", function () {
            var employee_directory = new EmployeeDirectory();
            var stock_price_record = stocks.StockPriceRecord.parse("20140101,1.00");
            var stock_record, employee, portfolio;
            stock_record = stocks.parseRecordLine("VEST,001B,20120102,1000,0.45");
            employee = employee_directory.createOrGetEmployee(stock_record._employee_id);
            employee.addRecordToPorfilio(stock_record);
            portfolio = employee.portfolio;

            expect(portfolio.stock_quantity).to.equal(1000);
            expect(portfolio.stock_records.length).to.equal(1);
            expect(portfolio.value_purchased).to.equal(0);
            expect(portfolio.value_vested).to.equal(450);
            expect(portfolio.value_sold).to.equal(0);
            expect(portfolio.value_earned).to.equal(0);
            expect(employee.calculateValueAtPrice(stock_price_record)).to.equal(1000);
            expect(employee.calculatePotentialEarningsAtPrice(stock_price_record)).to.equal(550);
            expect(employee.calculateEarningsUntil(stock_price_record.moment_recorded)).to.equal(0);

            stock_record = stocks.parseRecordLine("SALE,001B,20120402,500,1.00");
            employee = employee_directory.createOrGetEmployee(stock_record._employee_id);
            employee.addRecordToPorfilio(stock_record);
            portfolio = employee.portfolio;

            expect(portfolio.stock_quantity).to.equal(500);
            expect(portfolio.stock_records.length).to.equal(2);
            expect(portfolio.value_purchased).to.equal(500*0.45);
            expect(portfolio.value_vested).to.equal(500*0.45);
            expect(portfolio.value_sold).to.equal(500*1);
            expect(portfolio.value_earned).to.equal(500*(1-0.45));
            expect(employee.calculateValueAtPrice(stock_price_record)).to.equal(500);
            expect(employee.calculatePotentialEarningsAtPrice(stock_price_record)).to.equal(500*(1-0.45));
            expect(employee.calculateEarningsUntil(stock_price_record.moment_recorded)).to.equal(500*(1-0.45));

            stock_record = stocks.parseRecordLine("VEST,002B,20120102,1000,0.45");
            employee = employee_directory.createOrGetEmployee(stock_record._employee_id);
            employee.addRecordToPorfilio(stock_record);
            portfolio = employee.portfolio;

            expect(portfolio.stock_quantity).to.equal(1000);
            expect(portfolio.stock_records.length).to.equal(1);
            expect(portfolio.value_purchased).to.equal(0);
            expect(portfolio.value_vested).to.equal(1000*0.45);
            expect(portfolio.value_sold).to.equal(0);
            expect(portfolio.value_earned).to.equal(0);
            expect(employee.calculateValueAtPrice(stock_price_record)).to.equal(1000*1);
            expect(employee.calculatePotentialEarningsAtPrice(stock_price_record)).to.equal(550);
            expect(employee.calculateEarningsUntil(stock_price_record.moment_recorded)).to.equal(0);

            stock_record = stocks.parseRecordLine("PERF,001B,20130102,1.5");
            employee = employee_directory.createOrGetEmployee(stock_record._employee_id);
            employee.addRecordToPorfilio(stock_record);
            portfolio = employee.portfolio;

            expect(portfolio.stock_quantity).to.equal(500*1.5);
            expect(portfolio.stock_records.length).to.equal(3);
            expect(portfolio.value_purchased).to.equal(500*0.45);
            expect(portfolio.value_vested).to.equal(500*1.5*0.45);
            expect(portfolio.value_sold).to.equal(500*1);
            expect(portfolio.value_earned).to.equal(500*(1-0.45));
            expect(employee.calculateValueAtPrice(stock_price_record)).to.equal(500*1.5);
            expect(employee.calculatePotentialEarningsAtPrice(stock_price_record)).to.equal(412.5);
            expect(employee.calculateEarningsUntil(stock_price_record.moment_recorded)).to.equal(275);

            stock_record = stocks.parseRecordLine("PERF,002B,20130102,1.5");
            employee = employee_directory.createOrGetEmployee(stock_record._employee_id);
            employee.addRecordToPorfilio(stock_record);
            portfolio = employee.portfolio;

            expect(portfolio.stock_quantity).to.equal(1000*1.5);
            expect(portfolio.stock_records.length).to.equal(2);
            expect(portfolio.value_purchased).to.equal(0);
            expect(portfolio.value_vested).to.equal(1000*1.5*0.45);
            expect(portfolio.value_sold).to.equal(0);
            expect(portfolio.value_earned).to.equal(0);
            expect(employee.calculateValueAtPrice(stock_price_record)).to.equal(1000*1.5*1);
            expect(employee.calculatePotentialEarningsAtPrice(stock_price_record)).to.equal(550*1.5);
            expect(employee.calculateEarningsUntil(stock_price_record.moment_recorded)).to.equal(0);
        });
    })
});
