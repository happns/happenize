const context = require('../context');

const fs = { ...context.fs };

const readdir = require('./hn/readdir');

module.exports = readdir({ fs });
