#!/usr/bin/env node
'use strict';

const mock = require('mock-require');
const vfs = require('./vfs');

mock('fs', vfs);
vfs.connectHardLinksToFs();

require(process.cwd() + '/node_modules/snowpack/index.bin.js');
