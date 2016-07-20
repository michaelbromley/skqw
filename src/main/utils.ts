const fs = require('fs');
const util = require('util');
const log_file = fs.createWriteStream(__dirname + '/skqw-install.log', {flags : 'a'});
const log_stdout = process.stdout;

export const logToFile = function(d) {
    const time = new Date().toString() + ': \t';
    log_file.write(time + util.format(d) + '\r\n');
    log_stdout.write(time +util.format(d) + '\r\n');
};
