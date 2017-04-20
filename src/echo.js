/**
 * Created by Mitchell on 4/20/2017.
 */
/*
 Author: Mitchell Ludwig
 Date Created: 2017-04-19
 */

var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});
var entries_remaining;

rl.on('line', function(line) {
    console.log(line);
});