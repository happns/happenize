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

    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(callback).toHaveBeenCalledWith(null, ['test-file.html', 'test-file.html.vnode']);
});
