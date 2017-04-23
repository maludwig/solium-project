/**
 * Created by Mitchell on 4/22/2017.
 */
/**
 * Represents a specific amount of stocks at a specific price
 */
class Holding {
    /**
     * Creates a new Holding
     * @param {Number} quantity - The amount of the stock
     * @param {Number} price - The cost of each stock
     */
    constructor(quantity, price) {
        this.price = price;
        this.quantity = quantity;
    }
}
module.exports = Holding;