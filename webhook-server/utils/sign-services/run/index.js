"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = require("jsonwebtoken");
require("dotenv/config");
var readline_1 = require("readline");
function signServices() {
    var PRIVATE_JWT_KEY = process.env.PRIVATE_JWT_KEY;
    if (!PRIVATE_JWT_KEY) {
        throw new Error('PRIVATE_JWT_KEY environment variable is not defined');
    }
    var rl = (0, readline_1.createInterface)({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the Git Service Name\n\n', function (answer) {
        var serviceName = {
            name: answer.trim(),
        };
        console.log("Sign using: ".concat(PRIVATE_JWT_KEY));
        var token = (0, jsonwebtoken_1.sign)(serviceName, PRIVATE_JWT_KEY);
        console.log("The Git Service token\n\n".concat(token.trim()));
        rl.close();
    });
}
signServices();
