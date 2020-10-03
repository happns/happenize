const path = require('path');
const vfs = require('../..');
const aliases = require('../../aliases');

it('should return the same stat for an alias', async () => {

    const testFile = path.join(__dirname, '__mocks__', 'test-file.html');
    const alias = testFile + '.vnode';

    aliases[alias] = testFile;

    const expected = await vfs.promises.stat(testFile);
    const actual = await vfs.promises.stat(alias)

    expect(actual).toEqual(expected);
});
