const context = require('../context');

const fs = { ...context.fs };

const readdirSync = require('./hn/readdirSync');

module.exports = readdirSync({ fs });
