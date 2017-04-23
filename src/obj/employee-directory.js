/**
 * Created by Mitchell on 4/21/2017.
 */

var Employee = require("./employee");

/**
 * Represents a collection of Employees
 */
class EmployeeDirectory {
    /**
     * Creates an empty collection of Employees
     */
    constructor() {
        this._employees = {};
    }

    /**
     * For those cases when you need an employee, and if they don't exist, you want to make one
     * @param {String} employee_id - The employee's ID
     * @returns {Employee} - The employee
     */
    createOrGetEmployee(employee_id) {
        if(!(employee_id in this._employees)) {
            this._employees[employee_id] = new Employee(employee_id);
        }
        return this._employees[employee_id];
    }

    /**
     * For those cases when you want to get an employee, but if they don't exist, you want to know
     * @param {String} id - The employee's ID
     * @returns {Employee}
     */
    getEmployee(id) {
        return this._employees[id];
    }

    /**
     * Gets all of the employees
     * @returns {{}|*}
     */
    get employees() {
        return this._employees;
    }
}

module.exports = EmployeeDirectory;
