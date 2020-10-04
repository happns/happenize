const context = require('../context');

const fs = { ...context.fs };

const lstat = require('./hn/lstat');

module.exports = lstat({ fs });
