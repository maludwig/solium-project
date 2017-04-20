/**
 * Created by Mitchell on 4/20/2017.
 */

var fs = require('fs');
fs.createReadStream('templates/sample1-20140101-out.def').pipe(process.stdout);