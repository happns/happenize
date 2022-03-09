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

console.log(config);

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', err => {
        debugger
        console.error(err, 'Uncaught Exception thrown');
        process.exit(1);
    });

await startServer({
    config
}); // returns: SnowpackDevServer