const vfs = require('..');
const aliases = require('../aliases');

it('should notify the parent dir watch if alias is added inside it', async () => {
    const testDir = __dirname;
    const testFile = __filename;
    const alias = testFile + '.vnode';

    const listener = jest.fn();

    const watcher = vfs.watch(testDir, {}, listener);

    aliases[alias] = testFile;

    await new Promise(resolve => setTimeout(resolve, 100));

    watcher.close();
    
    expect(listener).toHaveBeenCalled();
});
