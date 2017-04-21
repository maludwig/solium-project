/**
 * Created by Mitchell on 4/21/2017.
 */

var Employee = require("./employee");
class EmployeeDirectory {
    constructor() {
        this._employees = {};
    }
    createOrGetEmployee(id) {
        if(!(id in this._employees)) {
            this._employees[id] = new Employee(id);
        }
        return this._employees[id];
    }
    getEmployee(id) {
        return this._employees[id];
    }
    get employees() {
        return this._employees;
    }
}

module.exports = EmployeeDirectory;
