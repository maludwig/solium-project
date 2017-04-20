/*
Author: Mitchell Ludwig
Date Created: 2017-04-19
 */

console.log("See README.md for instructions on how to install and run this project");
var parser = require('./src/stocks/parser');
//
// var readline = require('readline');
// var rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//     terminal: false
// });
// var entries_remaining;
//
// function read_first_line (line) {
//     entries_remaining = parseInt(line, 10);
//     rl.removeListener('line', read_first_line);
//     rl.on('line', read_middle_line);
// }
// function read_middle_line (line) {
//     entries_remaining--;
//     if (entries_remaining == 0) {
//         rl.removeListener('line', read_middle_line);
//         rl.on('line', read_last_line);
//     }
// }
// function read_last_line (line) {
//     process.stderr.write("boo");
//     console.log(`## ${line} ##`);
// }
//
// rl.on('line', read_first_line);
// rl.on('close', function(){
//     console.log(`## close ##`);
// })