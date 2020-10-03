const aliases = require('../../aliases');

const vfs = require('../..');
const path = require('path');

const fs = require('fs');

const touch = filename => {
    const time = new Date();

    try {
        vfs.utimesSync(filename, time, time);
    } catch (err) {
        vfs.closeSync(fs.openSync(filename, 'w'));
    }
}

it('should trigger listener when alias file changes', async () => {

    const testFile = path.join(__dirname, '__mocks__', 'test-file.html');
    const alias = testFile + '.vnode';

    aliases[alias] = testFile;

    const listener = jest.fn();

    const watcher = vfs.watch(alias, {}, listener);

    touch(testFile);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(listener).toHaveBeenCalled();

    watcher.close();
});

it('should save the listener in watcherListeners', async () => {
    const watcherListeners = require('../../watchListeners');

    const testDir = path.join(__dirname, '__mocks__')
    const testFile = path.join(testDir, 'test-file.html');
    const alias = testFile + '.vnode';

    aliases[alias] = testFile;

    const listener = jest.fn();

    const watcher = vfs.watch(testDir, {}, listener);

    expect(watcherListeners[testDir].size).toBe(1);
    
    watcher.close();

    expect(watcherListeners[testDir].size).toBe(0);
});
