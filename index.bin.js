#!/usr/bin/env node
'use strict';

const mock = require('mock-require');
const vfs = require('./vfs');

mock('fs', vfs);

require(process.cwd() + '/node_modules/snowpack/index.bin.js');
