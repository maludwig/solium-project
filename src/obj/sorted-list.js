/**
 * Created by Mitchell on 4/22/2017.
 */
class SortedList extends Array {
    constructor(sort_function, ...args) {
        super(...args);
        if (typeof sort_function === "function") {
            this._sort_function = sort_function;
        } else {
            this._sort_function = function (a, b) {
                if (a < b) {
                    return -1;
                } else if (a > b) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
    }
    insert(new_item) {
        var insertion_index = this.binarySearch(new_item); // Find insertion index
        this.splice(insertion_index, 0, new_item); // Insert record at desired index;
    }

    /**
     * Using a binary search, finds the index of the item, or, if the item is not present,
     * the index at which to insert the item
     * @param item - The item to find or insert
     * @returns {number} - The index found
     */
    binarySearch(item) {
        var min = 0;
        var max = this.length;
        var range;
        var index;
        var comparison_result;
        while (min != max) {
            range = max - min
            index = Math.floor(min + (range / 2));
            comparison_result = this._sort_function(item,this[index]);
            if (comparison_result < 0) {
                max = index;
            } else if (comparison_result > 0) {
                min = index + 1;
            } else {
                min = index;
                max = index;
            }
        }
        return min;
    }
}

module.exports = SortedList;