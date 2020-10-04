const aliases = require('../../aliases');

const vfs = require('../..');
const path = require('path');

it('should return the aliased files', async () => {

    const testDir = path.join(__dirname, '__mocks__');
    const testFile = path.join(testDir, 'test-file.html');
    const alias = testFile + '.vnode';

    aliases[alias] = testFile;

    const callback = jest.fn();

    vfs.readdir(testDir, {}, callback);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(callback).toHaveBeenCalledWith(null, ['test-file.html', 'test-file.html.vnode']);
});

it('should handle readdirp data module with aliased files', async () => {
    const cleanup = vfs.connectHardLinksToFs();

    const readdirp = require('readdirp');

    const testDir = path.join(__dirname, '__mocks__');
    const testFile = path.join(testDir, 'test-file.html');
    const alias = testFile + '.2.vnode';

    Object.keys(aliases).forEach(alias => delete aliases[alias]);

    aliases[alias] = testFile;

    const onData = jest.fn();

    readdirp(testDir, {
        type: 'files_directories',
        depth: 1
    }).on('data', onData);

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(onData).toHaveBeenCalled();
    expect(onData.mock.calls.length).toBe(2);
});
