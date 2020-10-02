jest.mock('../handlers');
const handlers = require('../handlers');

const getHandlerMatchByPath = require('../getHandlerMatchByPath');

const test = () => {
    const resultWithMatch = getHandlerMatchByPath('/some/path/to/index.js')
    const emptyResult = getHandlerMatchByPath('/some/path/to/other-file.txt');

    const expectAsyncOrNot = expected => {
        if (expected && expected.then) {
            return expect(expected).resolves;
        } else {
            return expect(expected);
        }
    }

    expectAsyncOrNot(resultWithMatch).toBeTruthy();
    expectAsyncOrNot(emptyResult).toBeFalsy();
};

it('should test the handle using RegExp', () => {

    handlers.length = 0;
    handlers.push({
        test: /index\.js$/
    });

    test();
});

it('should test the handle using function', () => {

    handlers.length = 0;
    handlers.push({
        test: (path) => path.match(/index\.js$/)
    });

    test();
});

it('should test the handle using async function', () => {
    handlers.length = 0;
    handlers.push({
        test: async (path) => path.match(/index\.js$/)
    });

    test();
});
