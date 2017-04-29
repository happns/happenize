var fs = require('fs');

module.exports = function(content) {
	this.cacheable();
	this.addContextDependency(this.context);

	if (content.indexOf("'auto-generate'") !== -1) {
		var contents = fs.readdirSync(this.context).filter(x => x !== 'index.js');

		var src = '';

		var modules = contents
		.filter(fileName => fileName[0] !== '.')
		.map(fileName => { 
				var name = fileName.split('.')[0];

				return { name: name, file: fileName };
			});

		for (var module of modules) { 
			src += `import ${module.name} from './${module.file}';\n`
		}

		src += `export default { ${modules.map(x => x.name).join(', ') } };\n`

		return src;
	}
	
	return content;
};
