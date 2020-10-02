jest.mock('../handlers');
const handlers = require('../handlers');

const vfs = require('..');

const INDEX_JS_CONTENT = 'This is a content of an index.js file';

handlers.length = 0;
handlers.push({
    test: /index\.js$/,
    load: (fileName, { fs }) => {
        expect(fs).toBeTruthy();

        return INDEX_JS_CONTENT;
    }
});

it('should handle promises.stat call for a file present in a vfs', async () => {
    const actual = await vfs.promises.stat('/some/path/to/index.js');

    expect(actual).toBeTruthy();
});

it('should handle readFileSync call for a file present in a vfs', () => {
    const actual = vfs.readFileSync('/some/path/to/index.js');

    expect(actual).toBe(INDEX_JS_CONTENT);
});
