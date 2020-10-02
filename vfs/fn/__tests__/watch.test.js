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

    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(listener).toHaveBeenCalled();

    watcher.close();
});
