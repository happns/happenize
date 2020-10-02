const generateIndexForDirectory = require('../index.js.js');

it('should generate the index js file for a given directory', () => {

    const src = generateIndexForDirectory({ path: __dirname + '/__mocks__' });

    expect(src).toContain('import template from \'./template.html\'');
    expect(src).toContain('import controller from \'./controller.js\'');
});
