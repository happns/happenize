#!/usr/bin/env node

'use strict';

import mock from 'mock-require';
import vfs from './vfs/index.js';

mock('fs', vfs);
vfs.connectHardLinksToFs();
mock('fsevents', './fsevents');

const {
    startServer,
    loadConfiguration
} = await import('snowpack');

const config = await loadConfiguration();
const nodeModulesExcludeIndex = config.exclude.indexOf('**/node_modules/**');

if (nodeModulesExcludeIndex !== -1) {
    config.exclude.splice(nodeModulesExcludeIndex, 1, "**/node_modules/!(happenize)**/*");
}

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        debugger
        console.error(err, 'Uncaught Exception thrown');
        process.exit(1);
    });

// const { logger } = await import('snowpack/lib/cjs/logger.js');
// logger.level = 'debug';

// XXX a workaround to make the subdirectory mount work
const mount = {};
config.mount = Object.keys(config.mount).sort().reverse().forEach(p => mount[p] = config.mount[p]);
config.mount = mount;

console.log(config);

await startServer({
    config
}); // returns: SnowpackDevServer
