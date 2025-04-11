"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = require("jsonwebtoken");
var path_1 = require("path");
var fs_1 = require("fs");
require("dotenv/config");
function signServices() {
    var PRIVATE_JWT_KEY = process.env.PRIVATE_JWT_KEY;
    if (!PRIVATE_JWT_KEY) {
        throw new Error('PRIVATE_JWT_KEY environment variable is not defined');
    }
    console.log('Sign using: ', PRIVATE_JWT_KEY);
    var readDir = (0, path_1.join)(__dirname, '../services.json');
    var servicesJson = (0, fs_1.readFileSync)(readDir, 'utf8');
    var services = JSON.parse(servicesJson);
    var tokens = [];
    for (var _i = 0, services_1 = services; _i < services_1.length; _i++) {
        var service = services_1[_i];
        tokens.push({
            name: service.name,
            token: (0, jsonwebtoken_1.sign)(service, PRIVATE_JWT_KEY),
        });
    }
    var writeDir = (0, path_1.join)(__dirname, '../tokens.json');
    (0, fs_1.writeFileSync)(writeDir, JSON.stringify(tokens, null, 2));
}
signServices();
