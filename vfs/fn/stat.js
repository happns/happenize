const context = require('../context');

const fs = { ...context.fs };

const stat = require('./hn/stat');

module.exports = stat({ fs });
