/**
 * Created by Mitchell on 4/22/2017.
 */
class SortedList extends Array {
    /**
     * Create a sorted list
     * @param compare_function - Desired function to use to sort,
     * @param args
     */
    constructor(compare_function, ...args) {
        super(...args);
        if (typeof compare_function === "function") {
            this._compare_function = compare_function;
        } else {
            this._compare_function = function (a, b) {
                if (a < b) {
                    return -1;
                } else if (a > b) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }

        /**
         * Inserts a new item into the list
         * T = O(log(n))
         * @param new_item
         */
        this.insert = function(new_item) {
            var insertion_index = this.binarySearch(new_item); // Find insertion index
            this.splice(insertion_index, 0, new_item); // Insert record at desired index;
        }

        /**
         * Using a binary search, finds the index of the item, or, if the item is not present,
         * the index at which to insert the item.
         * T = O(log(n))
         * @param item - The item to find or insert
         * @returns {number} - The index found
         */
        this.binarySearch = function(item) {
            var min = 0;
            var max = this.length;
            var range;
            var index;
            var comparison_result;
            while (min != max) {
                range = max - min
                index = Math.floor(min + (range / 2));
                comparison_result = this._compare_function(item,this[index]);
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

}

module.exports = SortedList;