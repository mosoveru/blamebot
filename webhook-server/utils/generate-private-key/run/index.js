"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var readline_1 = require("readline");
var crypto = require("crypto");
var rl = (0, readline_1.createInterface)({
    input: process.stdin,
    output: process.stdout,
});
rl.question('Enter random symbols\n\n', function (answer) {
    var hash = crypto.createHash('sha256').update(answer).digest('hex');
    console.log("\nYour Private JWT Key:\n\n".concat(hash));
    rl.close();
});
